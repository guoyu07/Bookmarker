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

.controller('MainCtrl', function($scope, $stateParams) {
})

.controller('ExploreCtrl', function($scope, Favorite) {
  $scope.favorites = [];
  Favorite.query().$promise.then(function(results) {
    $scope.favorites = results;
  });
})

.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, Entry, chunk, UserProfile) {
  $scope.chunks = [];

  $rootScope.$on('bmLayoutChanged', function(e, layoutStyle) {
    arr = UserProfile.getBmStyle(layoutStyle);
    $scope.chunks = chunk($rootScope.entries, arr[0]);
    $scope.bmClass = arr[1];
  });

  UserProfile.setting().then(function(results) {
    arr = UserProfile.getBmStyle(results.layout_style);
    $scope.bmClass = arr[1];
    Entry.query(function(results) {
      $rootScope.entries = results;
      $scope.chunks = chunk(results, arr[0]);
    });
  });

})

.controller('FavoriteCtrl', function($scope, $stateParams, Favorite, Entry, $ionicModal) {
  $ionicModal.fromTemplateUrl('templates/favor.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  Favorite.query(function(results) {
    $scope.favorites = results;
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

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
    var ds = UserProfile.getDisplayStyle($scope.displayStyle);
    setting.display_style = ds;

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
