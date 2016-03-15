angular.module('bookmarker.app.controller', [])

.controller('AppCtrl', function($scope, $state, $rootScope, UserProfile) {
  $rootScope.user = UserProfile.getProfile();
  $rootScope.$on('userLogging', function(e, d) {
    $rootScope.user = UserProfile.getProfile();
    window.location = '/';
    // $state.go('app.main.bookmarks');
  });

});
