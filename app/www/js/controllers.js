angular.module('bookmarker.controllers', ['bookmarker.api'])

.filter('favicon', function() {
  return function(url) {
    return 'http://grabicon.com/icon?domain=' + url + '&size=64'
  }
})

.controller('AppCtrl', function($scope, $timeout) {

})

.controller('LoginCtrl', function($scope, $stateParams, $rootScope, $state,
  Authentication, User, Setting, UI) {

  $scope.login = function() {
    username = $scope.username;
    password = $scope.password;
    Authentication.login(username, password, function(response, status, headers, config) {
      $state.go('app.main');
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
  }

  $scope.logout = function() {
    Authentication.logout();
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

.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, Entry, chunk, userProfile) {
  $scope.chunks = [];

  userProfile.setting().then(function(results) {
    arr = userProfile.getBmSize(results.display_style);
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

.controller('SettingCtrl', function($scope, $stateParams, $rootScope, Setting, userProfile, UI) {
  var setting = null;

  userProfile.setting().then(function(results) {
    setting = results;
    $scope.displayStyle = userProfile.getDisplayStyle(results.display_style);
    $scope.layoutStyle = userProfile.getLayoutStyle(results.layout_style);
  });

  $scope.changeDisplayStyle = function(displayStyle) {
    $scope.displayStyle = displayStyle;
    setting.display_style = userProfile.getDisplayStyle($scope.displayStyle);
    Setting.update({
      id: setting.id
    }, setting, function() {}, function() {
      UI.toast("修改失败");
    });
  }

  $scope.changeLayoutStyle = function(layoutStyle) {
    $scope.layoutStyle = layoutStyle;
    setting.layout_style = userProfile.getLayoutStyle($scope.layoutStyle);
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
