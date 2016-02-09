angular.module('bookmarker.controllers', ['bookmarker.api'])

.filter('favicon', function() {
  return function(url) {
    return 'http://grabicon.com/icon?domain=' + url + '&size=64'
  }
})

.controller('AppCtrl', function($scope, $timeout, Setting, $rootScope) {
  Setting.get({id: $rootScope.user.user_id}, function(results) {
    $rootScope.setting = results;
  });

})

.controller('LoginCtrl', function($scope, $stateParams, Authentication, User) {
  $scope.login = function() {
    username = $scope.username;
    password = $scope.password;
    Authentication.login(username, password);
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

.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, Entry, chunk) {
  $scope.chunks = [];
  Entry.query(function(results) {
    $rootScope.entries = results;
    $scope.chunks = chunk(results, 3);
  });
})

.controller('FavoriteCtrl', function($scope, $stateParams, Favorite) {
  Favorite.query(function(results) {
    $scope.favorites = results;
  });
})

.controller('SettingCtrl', function($scope, $stateParams) {

})

.controller('SearchCtrl', function($scope, $stateParams, $rootScope) {
  $scope.query = {};
  $scope.queryBy = 'title';

})

.controller('AboutCtrl', function($scope, $stateParams) {})

;
