// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('bookmarker', ['ionic', 'angular-jwt', 'ngCordova', 'bookmarker.controllers'])

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
    if(AuthService.isTokenExpired()) {
      $state.go('app.login');
    } else {
      // if(AuthService.isRemember()) {
      //   AuthService.refreshToken();
      // }
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

.value('MappingObject', function(obj) {
  function MappingObject(obj){this.obj=obj;}
  MappingObject.prototype.get = function(k_or_v) {
    if (k_or_v in obj) return obj[k_or_v];
    else {
      for(var k in obj) {
        if(obj.hasOwnProperty(k)) {
          if(obj[k] == k_or_v)
            return k;
        }
      }
    }
    return undefined;
  }
  return new MappingObject(obj);
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

.service('UserProfile', function(MappingObject, AuthService, Setting) {
  var displayMapping = MappingObject({
    "Big": "大",
    "Medium": "默认",
    "Small": "小"
  });
  var layoutMapping = MappingObject({
    "Wide": "宽",
    "Medium": "默认",
    "Narrow": "窄"
  });
  var userProfile = JSON.parse(localStorage.getItem('bookmarker.user.profile'));
  if(userProfile != null)
    AuthService.setIsLoggedIn(true);

  return {
    setProfile: function(profile) {
      if(profile != undefined && profile != null) {
        userProfile = profile;
      }
      localStorage.setItem('bookmarker.user.profile', JSON.stringify(profile));
    },
    getProfile: function() {
      if(!AuthService.isLoggedIn())
        return {'username': '未登录'};
      return userProfile;
    },
    getLayoutStyle: function(layoutStyle) {
      return layoutMapping.get(layoutStyle);
    },
    getDisplayStyle: function(displayStyle) {
      return displayMapping.get(displayStyle);
    },
    getBmSize: function(displayStyle) {
      if(displayStyle == "Big") return [2, "col-50"];
      else if(displayStyle == "Small") return [4, "col-25"];
      else return [3, "col-33"];
    },
    setting: function() {
      return Setting.get({id: userProfile.user_id}).$promise;
    }
  }
})

.service('AuthService', function($http, jwtHelper, API_HOST) {
  var TOKEN_NAME = 'bookmarker.token';
  var isLoggedIn = false;

  return {
    save: function(token) {
      isLoggedIn = true;
      localStorage.setItem(TOKEN_NAME, token);
    },
    get: function() {
      var token = localStorage.getItem(TOKEN_NAME);
      if(token == undefined)
        isLoggedIn = false;
      return token;
    },
    remove: function() {
      localStorage.removeItem(TOKEN_NAME);
    },
    decodeToken: function(token) {
      return jwtHelper.decodeToken(token);
    },
    getTokenAuthUrl: function() {
      return API_HOST + '/api-token-auth/';
    },
    getTokenExpirationDate: function() {
      return jwtHelper.getTokenExpirationDate(this.get());
    },
    isTokenExpired: function() {
      expired = jwtHelper.isTokenExpired(this.get());
      if(expired) isAuthed = false;
      return expired;
    },
    setIsLoggedIn: function(status) {
      isLoggedIn = status;
    },
    isLoggedIn: function() {
      return isLoggedIn;
    },
    isRemember: function() {
      return localStorage.getItem('rememberMe');
    },
    refreshToken: function() {
      if(this.getTokenExpirationDate() - new Date()/1000 < 1800)
      {
        $http.post(API_HOST+ '/api-token-refresh/', {
          token: localStorage.getItem('bookmarker.token')
        }).success(function(response){
          localStorage.setItem('bookmarker.token', response.token);
        });
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
          window.location = '#/app/login';
          // $state.go('app.login');
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
