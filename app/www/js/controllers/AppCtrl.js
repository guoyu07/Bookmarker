angular.module('bookmarker.app.controller', [])

.controller('AppCtrl', function($scope, $state, $rootScope, UserProfile) {
  $rootScope.user = UserProfile.getProfile();
  $rootScope.$on('userLogging', function(e, d) {
    $rootScope.user = UserProfile.getProfile();
    if($rootScope.isBrowser) {
      window.location = '/web';
    } else {
      window.location.href = window.location.href;
    }
  });

});
