// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('bookmarker', ['ionic', 'angular-jwt', 'ngCordova', 'bookmarker.controllers'])

.run(function($ionicPlatform, $rootScope, $state, Authentication, authToken) {
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
    if(authToken.isTokenExpired()) {
      $state.go('app.login');
      $rootScope.user = {'username': '未登录'};
    } else {
      $rootScope.user = authToken.getProfile();
      if(authToken.isRemember()) {
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

.value('chunk', function(arr, size) {
    var newArr = [];
    for (var i = 0; i < arr.length; i += size) {
      newArr.push(arr.slice(i, i + size));
    }
    return newArr;
})

.service('UI', function($http, $window, $q, $ionicLoading, $timeout){

  this.toast = function(msg, duration, position){
    if(!duration)
        duration = 'long';
    if(!position)
        position = 'center';

    if($window.plugins){
        if($window.plugins.toast)
            $window.plugins.toast.show(msg, duration, position,
                function(a){}, function(err){})
        return;
    }

    $ionicLoading.show({
        template: msg,
        noBackdrop: true,
        duration: (duration == 'long' ? 1500 : 700)
    });

}})

.service('authToken', function($http, jwtHelper, API_HOST) {
  var self = this;
  self.TOKEN_NAME = 'bookmarker.token';

  return {
    save: function(token) {
      localStorage.setItem(self.TOKEN_NAME, token);
    },
    get: function() {
      return localStorage.getItem(self.TOKEN_NAME);
    },
    getProfile: function() {
      var profile = null;
      try {
        profile = jwtHelper.decodeToken(this.get())
      } catch (e) {
        return {'username': '未登录'}
      }
      return profile;
    },
    remove: function() {
      localStorage.removeItem(self.TOKEN_NAME);
    },
    getTokenAuthUrl: function() {
      return API_HOST + '/api-token-auth/';
    },
    isTokenExpired: function() {
      return jwtHelper.isTokenExpired(this.get());
    },
    getTokenExpirationDate: function() {
      return jwtHelper.getTokenExpirationDate(this.get());
    },
    isRemember: function() {
      return localStorage.getItem('rememberMe');
    },
    refreshToken: function() {
      if(this.getTokenExpirationDate() - new Date()/1000 < 1800)
      {
        console.log(jwtHelper.getTokenExpirationDate(this.get()));
        $http.post(API_HOST+ '/api-token-refresh/', {
          token: localStorage.getItem('bookmarker.token')
        }).success(function(response){
          localStorage.setItem('bookmarker.token', response.token);
        });
        console.log(jwtHelper.getTokenExpirationDate(localStorage.getItem('bookmarker.token')));
      }
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
