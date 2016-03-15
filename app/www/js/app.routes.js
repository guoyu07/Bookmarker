angular.module('bookmarker.routes', [
  'bookmarker.app.controller',
  'bookmarker.login.controller',
  'bookmarker.main.controller',
  'bookmarker.bookmark.controller',
  'bookmarker.favorite.controller',
  'bookmarker.setting.controller',
  'bookmarker.search.controller',
  'bookmarker.explore.controller',
  'bookmarker.about.controller',
])

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
