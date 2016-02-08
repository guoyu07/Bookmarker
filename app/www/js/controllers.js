angular.module('bookmarker.controllers', ['bookmarker.api'])

.controller('AppCtrl', function($scope, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal

})

.controller('LoginCtrl', function($scope, $stateParams, Authentication, User) {
  $scope.login = function() {
    username = $scope.username;
    password = $scope.password;
    Authentication.login(username, password);
    if($scope.rememberMe) {
      Authentication.remember();
    }
  }

  $scope.register = function() {
    var user = new User({
      username: $scope.username,
      password: $scope.password,
    });
    user.$save();
  }

})

.controller('MainCtrl', function($scope, $stateParams) {})

.controller('ExploreCtrl', function($scope, Favorite, authToken) {
  $scope.favorites = [];
  Favorite.query(authToken.get()).$promise.then(function(results) {
    $scope.favorites = results;
  });
})

.controller('BookmarkCtrl', function($scope, $stateParams) {})

.controller('FavoriteCtrl', function($scope, $stateParams) {})

.controller('SettingCtrl', function($scope, $stateParams) {})

.controller('SearchCtrl', function($scope, $stateParams) {})

.controller('AboutCtrl', function($scope, $stateParams) {})

;
