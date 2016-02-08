// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('bookmarker', ['ionic', 'angular-jwt', 'bookmarker.controllers'])

.run(function($ionicPlatform, $rootScope, $state, Authentication, authToken, jwtHelper) {
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
    var token = authToken.get();
    if(jwtHelper.isTokenExpired(token)) {
      $state.go('app.login');
    } else {
      if((jwtHelper.getTokenExpirationDate(token) - new Date())/1000 < 300) {
        authToken.refreshToken();
      }
    }
  });

})

.constant('API_HOST', 'http://192.168.33.10')

.constant('API_URL', 'http://192.168.33.10/api')

.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
})

.service('authToken', function($http, jwtHelper, API_HOST) {
  return {
    save: function(token) {
      localStorage.setItem('bookmarker.token', token);
    },
    get: function() {
      return localStorage.getItem('bookmarker.token');
    },
    getTokenAuthUrl: function() {
      return API_HOST + '/api-token-auth/';
    },
    refreshToken: function() {
      // bug
      $http.post(API_HOST+ '/api-token-refresh/', {
        token: localStorage.getItem('bookmarker.token')
      }).success(function(response){
        localStorage.setItem('bookmarker.token', response.token);
      });
    }

  }
})

.config(['$httpProvider', function($httpProvider, $state) {
  $httpProvider.interceptors.push(function($window, $q) {
    return {
      'responseError': function(rejection) {
        var defer = $q.defer();

        if (rejection.status == 401) {
          $state.go('app.login');
        }
        defer.reject(rejection);
        return defer.promise;
      }
    };
  });

}])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl',
  })


  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl'
      }
    }
  })

  .state('app.explore', {
    url: '/explore',
    views: {
      'menuContent': {
        templateUrl: 'templates/explore.html',
        controller: 'ExploreCtrl'
      }
    }
  })

  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {
        templateUrl: 'templates/about.html',
        controller: 'AboutCtrl'
      }
    }
  })

  .state('app.main', {
    url: '/main',
    views: {
      'menuContent': {
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      }
    }
  })

  .state('app.main.bookmarks', {
    url: '/bookmarks',
    views: {
      'tab-bookmarks': {
        templateUrl: 'templates/bookmarks.html',
        controller: 'BookmarkCtrl'
      }
    }
  })

  .state('app.main.favorites', {
    url: '/favorites',
    views: {
      'tab-favorites': {
        templateUrl: 'templates/favorites.html',
        controller: 'FavoriteCtrl'
      }
    }
  })

  .state('app.main.setting', {
    url: '/setting',
    views: {
      'tab-setting': {
        templateUrl: 'templates/setting.html',
        controller: 'SettingCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/main');
});
