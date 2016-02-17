angular.module('bookmarker.controllers', ['bookmarker.api'])

.filter('favicon', function() {
  return function(url) {
    return 'http://grabicon.com/icon?domain=' + url + '&size=64'
  }
})

.controller('AppCtrl', function($scope, $timeout, $state, $rootScope, UserProfile) {
  $rootScope.user = UserProfile.getProfile();
  $rootScope.$on('userLogging', function(e, d) {
    $rootScope.user = UserProfile.getProfile();
    $state.go('app.main');
  });

})

.controller('LoginCtrl', function($scope, $stateParams, $rootScope, $state, $ionicModal, AuthService,
  Authentication, User, Setting, UserProfile, UI) {
  $scope.register = {};
  $scope.registerErrMsgs = {};

  $ionicModal.fromTemplateUrl('templates/register.html', {
    scope: $scope,
    animation: 'fadeIn'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.login = function(isValid) {
    if (isValid) {
      $scope.doLogin($scope.username, $scope.password, $scope.rememberMe == true);
    }
  }

  $scope.doLogin = function(username, password, rememberMe) {
    Authentication.login(username, password, function(response, status, headers, config) {
      var token = response.data.token;
      AuthService.save(token);
      UserProfile.setProfile(AuthService.decodeToken(token));
      $scope.$emit('userLogging');
    }, function(response, status, headers, config) {
      UI.toast('登录失败');
    });
    localStorage.setItem('rememberMe', rememberMe);
  }

  $scope.openRegister = function() {
    $scope.registerErrMsgs = {};
    $scope.modal.show();
  }

  $scope.cancelRegister = function() {
    $scope.modal.hide();
  }

  $scope.register = function(isValid) {
    if (isValid) {
      var user = new User({
        username: $scope.register.username,
        password: $scope.register.password,
        email: $scope.register.email
      });
      user.$save(function(user, putResponseHeaders) {
        $scope.doLogin($scope.register.username, $scope.register.password, false);
        $scope.modal.hide();
      }, function(response) {
        $scope.registerErrMsgs = response.data;
      });
    }
  }

  $scope.logout = function() {
    Authentication.logout();
    UserProfile.removeProfile();
    $state.go('app.login');
  }

})

.controller('MainCtrl', function($scope, $stateParams, $ionicTabsDelegate,
  $rootScope, UserFavorite, UserProfile, UserEntry, UI) {
  $scope.onSwipeLeft = function() {
    var index = $ionicTabsDelegate.selectedIndex();
    $ionicTabsDelegate.select((index + 1) % 3);
  }

  $rootScope.loading = true;

  UserProfile.setting().then(function(results) {
    $rootScope.quickMode = results.quick_mode;
    $rootScope.$emit('bmDisplayChanged', results.display_style);
    var arr = UserProfile.getBmStyle(results.layout_style);
    $rootScope.bmColumns = arr[0];
    $rootScope.bmClass = arr[1];
    UserEntry.query({
      id: UserProfile.getProfile().user_id
    }, function(results) {
      $rootScope.loading = false;
      $rootScope.entries = results;
      $rootScope.$broadcast('entryLoadingCompleted');
    }, function() {
      $rootScope.loading = false;
      UI.toast('加载书签失败');
    });
  }, function() {
    $rootScope.loading = false;
    UI.toast('加载设置失败');
  });

  UserFavorite.query({
    id: UserProfile.getProfile().user_id
  }).$promise.then(function(results) {
    $rootScope.favorites = results;
  });

})

.controller('ExploreCtrl', function($scope, Favorite) {
  $scope.exploreFavorites = [];
  Favorite.query(function(results) {
    $scope.exploreFavorites = results;
  });
})

.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, $filter, $ionicModal,
  $ionicPopover, Entry, UserEntry, chunk, UserProfile, UI) {
  $scope.chunks = [];
  $scope.displayMode = 1;
  $scope.loading = true;
  $scope.newEntry = {};
  $scope.createMode = true; // false if updateMode
  $scope.selectedEntry = null;
  $scope.priorityOptions = [{
    val: '1',
    name: "高"
  }, {
    val: '0',
    name: "默认"
  }, {
    val: '-1',
    name: "低"
  }];

  $ionicModal.fromTemplateUrl('templates/edit.html', {
    scope: $scope,
    animation: 'jelly'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $ionicPopover.fromTemplateUrl('templates/options.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.showOptions = function($event) {
    console.log($event);
    $scope.popover.show($event);
  }

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
    $scope.popover.remove();
  });

  $scope.quickAdd = function(isValid) {
    if (isValid) {

    }
  }

  $scope.submitEntry = function(entryForm) {
    var isValid = entryForm.$valid;
    if (isValid) {
      if ($scope.createMode == true)
        $scope.addEntry();
      else
        $scope.updateEntry();
      entryForm.$submitted = false;
    }
  }

  $scope.addEntry = function() {
    var entry = new Entry({
      title: $scope.newEntry.title,
      url: $scope.newEntry.url,
      remark: $scope.newEntry.remark,
      priority: $scope.newEntry.priority || 0,
      belong: $scope.newEntry.belong
    });
    entry.$save(function(entry, putResponseHeaders) {
      $rootScope.entries.push(entry);
      $scope.loadEntries();
      $scope.modal.hide();
    }, function() {
      UI.toast('添加失败');
    });
  }

  $scope.updateEntry = function() {
    if ($scope.selectedEntry != null) {
      angular.extend($scope.selectedEntry, $scope.newEntry)
      Entry.update({
        id: $scope.selectedEntry.id
      }, $scope.selectedEntry, function() {
        var index = $rootScope.entries.map(function(x) {
          return x.id;
        }).indexOf($scope.selectedEntry.id);
        $scope.selectedEntry.priority = parseInt($scope.selectedEntry.priority);
        $rootScope.entries[index] = $scope.selectedEntry;
        $scope.loadEntries();
        $scope.closeModal();
      }, function() {
        UI.toast('更新失败');
      });
    } else {
      UI.toast('更新失败');
    }
  }

  $scope.editEntry = function(entryId) {
    $scope.createMode = false;
    var found = $filter('filter')($rootScope.entries, {
      id: entryId
    }, true);
    if (found.length) {
      $scope.selectedEntry = found[0];
      $scope.newEntry.title = $scope.selectedEntry.title;
      $scope.newEntry.url = $scope.selectedEntry.url;
      $scope.newEntry.remark = $scope.selectedEntry.remark;
      $scope.newEntry.priority = $scope.selectedEntry.priority.toString();
      $scope.newEntry.belong = $scope.selectedEntry.belong.toString();
    }
    $scope.modal.show();
  }

  $scope.removeEntry = function(entry) {
    Entry.remove({
      id: entry.id
    }, function() {
      $rootScope.entries.splice($rootScope.entries.indexOf(entry), 1);
      $scope.loadEntries();
      UI.toast('删除成功');
    }, function() {
      UI.toast('删除失败');
    });
  }

  $scope.showCreateModal = function() {
    $scope.createMode = true;
    $scope.newEntry = {};
    $scope.modal.show();
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  }

  $scope.loadEntries = function() {
    $scope.chunks = chunk($filter('orderBy')($rootScope.entries, '-priority', false), $rootScope.bmColumns);
  }

  $scope.doRefresh = function() {
    $scope.loadEntries();
    $rootScope.$broadcast('scroll.refreshComplete');
  }

  $scope.$on('entryLoadingCompleted', function() {
    $scope.loadEntries();
  });

  $rootScope.$on('bmAddModeChanged', function(e, isOpen) {

  });

  $rootScope.$on('bmLayoutChanged', function(e, layoutStyle) {
    arr = UserProfile.getBmStyle(layoutStyle);
    $scope.chunks = chunk($rootScope.entries, arr[0]);
    $scope.bmClass = arr[1];
  });

  $rootScope.$on('bmDisplayChanged', function(e, displayStyle) {
    if (displayStyle == "Detail") $scope.displayMode = 2;
    else if (displayStyle == "Short") $scope.displayMode = 0;
    else $scope.displayMode = 1;
  });

})

.controller('FavoriteCtrl', function($scope, $stateParams, $rootScope, Favorite, UserFavorite, Entry,
  UserProfile, chunk, $ionicModal, $ionicPopup, UI) {
  $scope.newFavor = {}
  var popUpOptions = {
    template: '<input type="text" maxlength="32" ng-model="newFavor.name">',
    title: '输入收藏夹名称',
    scope: $scope,
    buttons: [{
      text: '取消'
    }, {
      text: '<b>保存</b>',
      type: 'button-positive',
      onTap: function(e) {
        if (!$scope.newFavor.name) {
          e.preventDefault();
        } else {
          return $scope.newFavor.name;
        }
      }
    }, ]
  };

  $ionicModal.fromTemplateUrl('templates/favor.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.closeModal = function() {
    $scope.modal.hide();
  }

  $scope.addFavorite = function() {
    $scope.newFavor.name = "";
    var myPopup = $ionicPopup.show(popUpOptions);
    myPopup.then(function(name) {
      if (name) {
        var favor = new Favorite({
          name: name
        });
        favor.$save(function(favor) {
          $rootScope.favorites.push(favor);
          console.log($rootScope.favorites);
        });
      }
    });
  };

  $scope.editFavorite = function(favor) {
    $scope.newFavor.name = favor.name;
    var myPopup = $ionicPopup.show(popUpOptions);
    myPopup.then(function(name) {
      if (name) {
        favor.name = name;
        Favorite.update({
          id: favor.id
        }, favor, function() {
          var index = $rootScope.favorites.indexOf(favor);
          $rootScope.favorites[index].name = name;
        }, function() {
          UI.toast('更新失败');
        });
      }
    });
  }

  $scope.removeFavorite = function(favor) {
    Favorite.remove({
      id: favor.id
    }, function() {
      $rootScope.favorites.splice($rootScope.favorites.indexOf(favor), 1);
      UI.toast('删除成功');
    }, function() {
      UI.toast('删除失败');
    });
  }

  $scope.showFavorite = function(id) {
    Favorite.get({
      id: id
    }, function(results) {
      $scope.favor = results;
      $scope.favorites = chunk(results.entries, 3);
      $scope.modal.show();
    })
  }
})

.controller('SettingCtrl', function($scope, $stateParams, $rootScope, Setting, UserProfile, UI) {
  var setting = null;

  UserProfile.setting().then(function(results) {
    setting = results;
    $scope.displayStyle = UserProfile.getDisplayStyle(results.display_style);
    $scope.layoutStyle = UserProfile.getLayoutStyle(results.layout_style);
  });

  $scope.updateSetting = function() {
    Setting.update({
      id: setting.id
    }, setting, function() {}, function() {
      UI.toast("修改失败");
    });
  }

  $scope.changeDisplayStyle = function(displayStyle) {
    var ds = UserProfile.getDisplayStyle(displayStyle);
    setting.display_style = ds;
    $rootScope.$emit('bmDisplayChanged', ds);

    $scope.updateSetting();
  }

  $scope.changeLayoutStyle = function(layoutStyle) {
    var ls = UserProfile.getLayoutStyle(layoutStyle);
    setting.layout_style = ls;
    $rootScope.$emit('bmLayoutChanged', ls);

    $scope.updateSetting();
  }

  $scope.changeQuickMode = function(quickMode) {
    $rootScope.quickMode = quickMode;
    setting.quick_mode = quickMode;

    $scope.updateSetting();
  }

})

.controller('SearchCtrl', function($scope, $stateParams, $rootScope) {
  $scope.query = {};
  $scope.queryBy = 'title';

})

.controller('AboutCtrl', function($scope, $stateParams) {})

;
