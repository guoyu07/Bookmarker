angular.module('bookmarker.clip.service', [])

.service('ClipboardService', function($window, $rootScope, $q, $cordovaClipboard) {
  return {
    copy: function(text) {
      return $cordovaClipboard.copy(text);
    },
    parse: function() {
      if ($window.plugins) {
        $cordovaClipboard
          .paste()
          .then(function(result) {}, function() {});
      }
    }
  }
});
