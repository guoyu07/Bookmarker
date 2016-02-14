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

.controller('LoginCtrl', function($scope, $stateParams, $rootScope, $state, AuthService,
  Authentication, User, Setting, UserProfile, UI) {

  $scope.login = function() {
    username = $scope.username;
    password = $scope.password;

    Authentication.login(username, password, function(response, status, headers, config) {
      var token = response.data.token;
      AuthService.save(token);
      UserProfile.setProfile(AuthService.decodeToken(token));
      $scope.$emit('userLogging');
    }, function(response, status, headers, config) {
      UI.toast('登录失败');
    });
    localStorage.setItem('rememberMe', $scope.rememberMe);
  }

  $scope.register = function() {
    var user = new User({
      username: $scope.username,
      password: $scope.password,
    });
    user.$save();
    $scope.login($scope.username, $scope.password);
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
    $ionicTabsDelegate.select((index+1) % 3);
  }

  $rootScope.loading = true;

  UserProfile.setting().then(function(results) {
    $rootScope.$emit('bmDisplayChanged', results.display_style);
    var arr = UserProfile.getBmStyle(results.layout_style);
    $rootScope.bmColumns = arr[0];
    $rootScope.bmClass = arr[1];
    UserEntry.query({id: UserProfile.getProfile().user_id}, function(results) {
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

  UserFavorite.query({id: UserProfile.getProfile().user_id}).$promise.then(function(results) {
    $rootScope.favorites = results;
  });

})

.controller('ExploreCtrl', function($scope, Favorite) {
  $scope.exploreFavorites = [];
  Favorite.query(function(results) {
    $scope.exploreFavorites = results;
  });
})

.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, $ionicModal,
      Entry, UserEntry, chunk, UserProfile, UI) {
  $scope.chunks = [];
  $scope.displayMode = 1;
  $scope.loading = true;
  $scope.newEntry = {};

  $ionicModal.fromTemplateUrl('templates/create.html', {
    scope: $scope,
    animation: 'jelly'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.showCreateModal = function() {
    $scope.modal.show();
  }

  $scope.addEntry = function() {
    var entry = new Entry({
      title: $scope.newEntry.title,
      url: $scope.newEntry.url,
      remark: $scope.newEntry.remark,
      belong: $scope.newEntry.belong
    });
    // entry.$save(function(user, putResponseHeaders) {
    //   console.log(user);
    //   console.log(putResponseHeaders);
    // });
    // $scope.modal.hide();
  }

  $scope.editEntry = function(entryId) {
    console.log('edit '+entryId);
  }

  $scope.removeEntry = function(entryId) {
    console.log('remove '+entryId);
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  }

  $scope.$on('entryLoadingCompleted', function(){
    $scope.chunks = chunk($rootScope.entries, $rootScope.bmColumns);
  });

  $rootScope.$on('bmLayoutChanged', function(e, layoutStyle) {
    arr = UserProfile.getBmStyle(layoutStyle);
    $scope.chunks = chunk($rootScope.entries, arr[0]);
    $scope.bmClass = arr[1];
  });

  $rootScope.$on('bmDisplayChanged', function(e, displayStyle) {
    if(displayStyle == "Detail") $scope.displayMode = 2;
    else if(displayStyle == "Short") $scope.displayMode = 0;
    else $scope.displayMode = 1;
  });

})

.controller('FavoriteCtrl', function($scope, $stateParams, Favorite, UserFavorite, Entry,
      UserProfile, $ionicModal) {
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
    Favorite.get({id: id}, function(results) {
      $scope.favor = results;
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

  $scope.changeDisplayStyle = function(displayStyle) {
    var ds = UserProfile.getDisplayStyle(displayStyle);
    setting.display_style = ds;
    $rootScope.$emit('bmDisplayChanged', ds);

    Setting.update({
      id: setting.id
    }, setting, function() {}, function() {
      UI.toast("修改失败");
    });
  }

  $scope.changeLayoutStyle = function(layoutStyle) {
    var ls = UserProfile.getLayoutStyle(layoutStyle);
    setting.layout_style = ls;
    $rootScope.$emit('bmLayoutChanged', ls);

    Setting.update({
      id: setting.id
    }, setting, function() {}, function() {
      UI.toast("修改失败");
    });
  }

})

.controller('SearchCtrl', function($scope, $stateParams, $rootScope) {
  $scope.query = {};
  $scope.queryBy = 'title';

})

.controller('AboutCtrl', function($scope, $stateParams) {})

;
