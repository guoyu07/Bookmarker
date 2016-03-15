angular.module('bookmarker.search.controller', [])

.controller('SearchCtrl', function($scope, $stateParams, $filter, $rootScope) {
  $scope.query = {};
  $scope.queryBy = 'title';

});
