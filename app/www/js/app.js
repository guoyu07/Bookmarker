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
    if (AuthService.isTokenExpired()) {
      $state.go('app.login');
    } else {

    }
  });

  $rootScope.fromBrowser = document.URL.match(/^https?:/) != null;

})

.directive('ngRightClick', function($parse) {
  return function(scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick);
    element.bind('contextmenu', function(event) {
      scope.$apply(function() {
        event.preventDefault();
        fn(scope, {
          $event: event
        });
      });
    });
  };
})

.directive('clickForOptions', ['$ionicGesture', function($ionicGesture) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $ionicGesture.on('hold', function(e) {
        var content = element[0].querySelector('.item-content');
        var buttons = element[0].querySelector('.item-options');

        if (!buttons) {
          return;
        }
        var buttonsWidth = buttons.offsetWidth;

        ionic.requestAnimationFrame(function() {
          content.style[ionic.CSS.TRANSITION] = 'all ease-out .25s';

          if (!buttons.classList.contains('invisible')) {
            content.style[ionic.CSS.TRANSFORM] = '';
            setTimeout(function() {
              buttons.classList.add('invisible');
            }, 250);
          } else {
            buttons.classList.remove('invisible');
            content.style[ionic.CSS.TRANSFORM] = 'translate3d(-' + buttonsWidth + 'px, 0, 0)';
          }
        });

      }, element);
    }
  };
}])

.constant('API_HOST', 'http://ivwsyygyfnhv-lbm.daoapp.io')

.constant('API_URL', 'http://ivwsyygyfnhv-lbm.daoapp.io/api')

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
})

.service('ClipboardService', function($window, $q, $cordovaClipboard) {
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
})

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
})

.service('UserProfile', function(MappingObject, AuthService, User, Setting, $q, $rootScope) {
  var displayMapping = MappingObject({
    "Detail": "详细",
    "Medium": "默认",
    "Short": "简短"
  });
  var layoutMapping = MappingObject({
    "Wide": "宽",
    "Medium": "默认",
    "Narrow": "窄"
  });

  var userProfile = JSON.parse(localStorage.getItem('bookmarker.user.profile'));

  if (userProfile != null) {
    AuthService.setIsLoggedIn(true);
  }

  return {
    initProfile: function() {
      userProfile = AuthService.decodeToken(AuthService.get());
      localStorage.setItem('bookmarker.user.profile', JSON.stringify(userProfile));
    },
    removeProfile: function() {
      localStorage.removeItem('bookmarker.user.profile');
    },
    getProfile: function() {
      if (!AuthService.isLoggedIn())
        return {
          'username': '未登录'
        };
      return userProfile;
    },
    getLayoutStyle: function(layoutStyle) {
      return layoutMapping.get(layoutStyle);
    },
    getDisplayStyle: function(displayStyle) {
      return displayMapping.get(displayStyle);
    },
    getBmStyle: function(layoutStyle) {
      if (layoutStyle == "Wide") return [2, "col-50"];
      else if (layoutStyle == "Narrow") return [4, "col-25"];
      else return [3, "col-33"];
    },
    setting: function() {
      var deferred = $q.defer();

      User.get({
        id: userProfile.user_id
      }, function(profile) {
        userProfile = profile;
        $rootScope.user = profile;
        localStorage.setItem('bookmarker.user.profile', JSON.stringify(profile));
        Setting.get({
          id: profile.setting
        }, function(setting) {
          deferred.resolve(setting);
        }, function(err) {
          deferred.reject(err);
        });
      }, function() {
        deferred.reject(err);
      });
      return deferred.promise;
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
      if (token == undefined)
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
      try {
        expired = jwtHelper.isTokenExpired(this.get());
        if (expired) isLoggedIn = false;
      } catch (e) {
        return true;
      }
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
      if (this.getTokenExpirationDate() - new Date() / 1000 < 1800) {
        $http.post(API_HOST + '/api-token-refresh/', {
          token: localStorage.getItem('bookmarker.token')
        }).success(function(response) {
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

.factory('UpdateService', function($http, $cordovaAppVersion, $ionicPopup, $timeout, $ionicLoading,
  $cordovaFileTransfer, $cordovaFileOpener2, UI, $window) {

  var Update = {
    check: function(view) {
      if (!$window.cordova) {
        return;
      }
      var url = 'http://ivwsyygyfnhv-lbm.daoapp.io/package/version.json';
      $http.get(url).success(function(res) {
        var serveAppVersion = res.version;
        if ($cordovaAppVersion === undefined) {
          return;
        }
        $cordovaAppVersion.getVersionNumber().then(function(version) {
          if (parseFloat(version) < parseFloat(serveAppVersion)) {
            showUpdateConfirm(res);
          } else {
            if (view !== 'main') {
              UI.toast('当前版本是最新的');
            }
          }
        });
      }).error(function(response) {
        console.log(response);
      });
    }
  };
  var showUpdateConfirm = function(data) {
    var confirmPopup = $ionicPopup.confirm({
      title: '升级到最新版本：v' + data.version,
      template: data.info,
      cancelText: '取消',
      okText: '升级'
    });
    confirmPopup.then(function(res) {
      if (res) {
        $ionicLoading.show({
          template: "已经下载：0%"
        });

        var url = 'http://ivwsyygyfnhv-lbm.daoapp.io/package/Lightbm.apk';
        var targetPath = '/sdcard/Download/Lightbm.apk';
        var trustHosts = true;
        var options = {};

        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function(result) {
          $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(function() {
          }, function(err) {
            alert(err);
          });
          $ionicLoading.hide();
        }, function(err) {
          alert(err);
          $ionicLoading.hide();
        }, function(progress) {
          var downloadProgress;
          $timeout(function() {
            downloadProgress = (progress.loaded / progress.total) * 100;
            $ionicLoading.show({
              template: '已经下载：' + Math.floor(downloadProgress) + '%'
            });
            if (downloadProgress > 99) {
              $ionicLoading.hide();
            }
          })
        });
      }
    });
  };
  return Update;
})

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
