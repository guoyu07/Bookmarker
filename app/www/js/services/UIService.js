angular.module('bookmarker.ui.service', [])

.service('UI', function($http, $window, $q, $ionicLoading, $timeout) {

  this.toast = function(msg, duration, position) {
    if (!duration)
      duration = 'long';
    if (!position)
      position = 'center';

    if ($window.plugins) {
      if ($window.plugins.toast)
        $window.plugins.toast.show(msg, duration, position,
          function(a) {},
          function(err) {})
      return;
    }

    $ionicLoading.show({
      template: msg,
      noBackdrop: true,
      duration: duration
    });

  }
});
