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

.controller('LoginCtrl', function($scope, $stateParams) {})

.controller('MainCtrl', function($scope, $stateParams) {})

.controller('ExploreCtrl', function($scope, Favorite) {
    $scope.favorites = [];
    Favorite.query().$promise.then(function(results) {
      $scope.favorites = results;
    });
    console.log($scope.favorites);

})

.controller('BookmarkCtrl', function($scope, $stateParams) {})

.controller('FavoriteCtrl', function($scope, $stateParams) {})

.controller('SettingCtrl', function($scope, $stateParams) {})

.controller('SearchCtrl', function($scope, $stateParams) {})

.controller('AboutCtrl', function($scope, $stateParams) {})

;
