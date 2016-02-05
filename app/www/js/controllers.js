angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal

})

.controller('LoginCtrl', function($scope, $stateParams) {
})

.controller('MainCtrl', function($scope, $stateParams) {
})

.controller('ExploreCtrl', function($scope, $http, $stateParams) {
  $scope.posts = [];
  return $http.get('/api/favorites').then(function(result) {
    return angular.forEach(result.data, function(item) {
      return $scope.posts.push(item);
    });
  });
})

.controller('SettingCtrl', function($scope, $stateParams) {
})

;
