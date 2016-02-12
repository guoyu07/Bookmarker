angular.module('bookmarker.controllers', ['bookmarker.api'])

.filter('favicon', function() {
  return function(url) {
    return 'http://grabicon.com/icon?domain=' + url + '&size=64'
  }
})

.controller('AppCtrl', function($scope, $timeout, $state, $rootScope, UserProfile) {
  $rootScope.user = UserProfile.getProfile();
  console.log($rootScope.user);
  $rootScope.$on('userLogging', function(e, d) {
    $rootScope.user = UserProfile.getProfile();
    $state.go('app.main');
  });

})

.controller('LoginCtrl', function($scope, $stateParams, $rootScope, $state, AuthService,
  Authentication, User, Setting, UserProfile, UI) {
  console.log('LoginCtrl');

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
  }

})

.controller('MainCtrl', function($scope, $stateParams) {
  console.log('MainCtrl');
})

.controller('ExploreCtrl', function($scope, Favorite) {
  $scope.favorites = [];
  Favorite.query().$promise.then(function(results) {
    $scope.favorites = results;
  });
})

.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, Entry, chunk, UserProfile) {
  console.log('BookmarkCtrl');
  $scope.chunks = [];

  UserProfile.setting().then(function(results) {
    arr = UserProfile.getBmSize(results.display_style);
    $scope.bmSize = arr[0];
    $scope.bmClass = arr[1];
  });

  Entry.query(function(results) {
    $rootScope.entries = results;
    $scope.chunks = chunk(results, $scope.bmSize);
  });
})

.controller('FavoriteCtrl', function($scope, $stateParams, Favorite) {
  Favorite.query(function(results) {
    $scope.favorites = results;
  });
})

.controller('SettingCtrl', function($scope, $stateParams, Setting, UserProfile, UI) {
  console.log('SettingCtrl');
  var setting = null;
  console.log(UserProfile.getProfile());
  UserProfile.setting().then(function(results) {
    setting = results;
    $scope.displayStyle = UserProfile.getDisplayStyle(results.display_style);
    $scope.layoutStyle = UserProfile.getLayoutStyle(results.layout_style);
  });

  $scope.changeDisplayStyle = function(displayStyle) {
    $scope.displayStyle = displayStyle;
    setting.display_style = UserProfile.getDisplayStyle($scope.displayStyle);
    Setting.update({
      id: setting.id
    }, setting, function() {}, function() {
      UI.toast("修改失败");
    });
  }

  $scope.changeLayoutStyle = function(layoutStyle) {
    $scope.layoutStyle = layoutStyle;
    setting.layout_style = UserProfile.getLayoutStyle($scope.layoutStyle);
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
