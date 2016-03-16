// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('bookmarker', ['ionic', 'angular-jwt', 'ngCordova',
  'bookmarker.api',
  'bookmarker.directives',
  'bookmarker.routes',
  'bookmarker.auth.service',
  'bookmarker.clip.service',
  'bookmarker.user.service',
  'bookmarker.update.service',
  'bookmarker.ui.service',
])

.run(function($ionicPlatform, $rootScope, $state, Authentication, AuthService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$locationChangeSuccess', function(event, toState, toStateParams) {
    if (AuthService.isTokenExpired()) {
      $state.go('app.login');
    } else {

    }
  });

  $rootScope.isBrowser = document.URL.match(/^https?:/) != null;
  $rootScope.isCordova = !!window.cordova;

})

.constant('API_HOST', 'http://lbm.daoapp.io')
// .constant('API_HOST', 'http://192.168.33.10')

.constant('API_URL', 'http://lbm.daoapp.io/api')
// .constant('API_URL', 'http://192.168.33.10/api')

.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
})

.value('chunk', function(arr, size) {
  var newArr = [];
  for (var i = 0; i < arr.length; i += size) {
    newArr.push(arr.slice(i, i + size));
  }
  return newArr;
})

.value('MappingObject', function(obj) {
  function MappingObject(obj) {
    this.obj = obj;
  }
  MappingObject.prototype.get = function(k_or_v) {
    if (k_or_v in obj) return obj[k_or_v];
    else {
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          if (obj[k] == k_or_v)
            return k;
        }
      }
    }
    return undefined;
  }
  return new MappingObject(obj);
});
