angular.module('bookmarker.explore.controller', ['bookmarker.api'])

.controller('ExploreCtrl', function($scope, Favorite) {
  $scope.exploreFavorites = [];
  Favorite.query(function(results) {
    $scope.exploreFavorites = results;
  });
});
