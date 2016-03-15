angular.module('bookmarker.about.controller', [])

.controller('AboutCtrl', function($scope, $stateParams, UpdateService) {
  $scope.checkUpdate = function() {
    UpdateService.check();
  }
});
