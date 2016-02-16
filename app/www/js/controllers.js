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
  $scope.registerErrorMessages = [];

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
      $scope.doLogin($scope.username, $scope.password, $scope.rememberMe==true);
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
    $scope.modal.show();
  }

  $scope.cancelRegister = function() {
    $scope.modal.hide();
  }

  $scope.register = function(isValid) {
    if (isValid) {
      $scope.registerErrorMessages = [];
      var user = new User({
        username: $scope.register.username,
        password: $scope.register.password,
        email: $scope.register.email
      });
      user.$save(function(user, putResponseHeaders){
        $scope.doLogin($scope.register.username, $scope.register.password, false);
        $scope.modal.hide();
      }, function(response) {
        for(var key in response.data) {
          $scope.registerErrorMessages = $scope.registerErrorMessages.concat(response.data[key])
        }
        console.log($scope.registerErrorMessages);
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
  Entry, UserEntry, chunk, UserProfile, UI) {
  $scope.chunks = [];
  $scope.displayMode = 1;
  $scope.loading = true;
  $scope.newEntry = {};
  $scope.createMode = true; // false if updateMode
  $scope.selectedEntry = null;

  $ionicModal.fromTemplateUrl('templates/edit.html', {
    scope: $scope,
    animation: 'jelly'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.doRefresh = function() {
    UserEntry.query({
      id: UserProfile.getProfile().user_id
    }, function(results) {
      $rootScope.entries = results;
      $scope.chunks = chunk($rootScope.entries, $rootScope.bmColumns);
      $rootScope.$broadcast('scroll.refreshComplete');
    }, function() {
      $rootScope.$broadcast('scroll.refreshComplete');
      UI.toast('加载书签失败');
    });
  }

  $scope.quickAdd = function(isValid) {
    if (isValid) {

    }
  }

  $scope.submitEntry = function(isValid) {
    if($scope.createMode == true)
      $scope.addEntry(isValid);
    else
      $scope.updateEntry(isValid);
  }

  $scope.addEntry = function(isValid) {
    if (isValid) {
      var entry = new Entry({
        title: $scope.newEntry.title,
        url: $scope.newEntry.url,
        remark: $scope.newEntry.remark,
        belong: $scope.newEntry.belong
      });
      entry.$save(function(entry, putResponseHeaders) {
        $rootScope.entries.push(entry);
        $scope.chunks = chunk($rootScope.entries, $rootScope.bmColumns);
        $scope.modal.hide();
      }, function() {
        UI.toast('添加失败');
      });
    }
  }

  $scope.updateEntry = function(isValid) {
    if (isValid) {
      if ($scope.selectedEntry != null) {
        $scope.selectedEntry.title = $scope.newEntry.title;
        $scope.selectedEntry.url = $scope.newEntry.url;
        $scope.selectedEntry.remark = $scope.newEntry.remark;
        $scope.selectedEntry.belong = $scope.newEntry.belong;
        Entry.update({id: $scope.selectedEntry.id}, $scope.selectedEntry, function() {
          $scope.closeModal();
        }, function(){
          UI.toast('更新失败');
        });
      } else {
        UI.toast('更新失败');
      }
    }
  }

  $scope.editEntry = function(entryId) {
    $scope.createMode = false;
    var found = $filter('filter')($rootScope.entries, {id: entryId}, true);
    if(found.length) {
      $scope.selectedEntry = found[0];
      $scope.newEntry.title = $scope.selectedEntry.title;
      $scope.newEntry.url = $scope.selectedEntry.url;
      $scope.newEntry.remark = $scope.selectedEntry.remark;
      $scope.newEntry.belong = $scope.selectedEntry.belong;
    }
    $scope.modal.show();
  }

  $scope.removeEntry = function(entry) {
    Entry.remove({
      id: entry.id
    }, function() {
      console.log($rootScope.entries.splice($rootScope.entries.indexOf(entry), 1));
      $scope.chunks = chunk($rootScope.entries, $rootScope.bmColumns);
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

  $scope.$on('entryLoadingCompleted', function() {
    $scope.chunks = chunk($rootScope.entries, $rootScope.bmColumns);
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

.controller('FavoriteCtrl', function($scope, $stateParams, Favorite, UserFavorite, Entry,
  UserProfile, chunk, $ionicModal) {
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
