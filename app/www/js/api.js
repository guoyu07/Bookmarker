function make_resource(path, isArray) {
  return function($resource, AuthService, API_URL) {
    var headers = {
      'Authorization': function(){return 'JWT ' + AuthService.get();}
    };
    return $resource(API_URL + '/' + path + '/:id/', {
      id: '@id'
    }, {
      query: {
        method: 'GET',
        isArray: isArray || false,
        headers: headers
      },
      get: {
        method: 'GET',
        headers: headers
      },
      save: {
        method: 'POST',
        headers: headers
      },
      remove: {
        method: 'DELETE',
        headers: headers
      },
      delete: {
        method: 'DELETE',
        headers: headers
      },
      update: {
        method: 'PUT',
        headers: headers
      }
    });
  }
}

angular.module('bookmarker.api', ['ngResource'])

.factory('Authentication', [
  '$http', '$state', 'AuthService',
  function($http, $state, AuthService) {
    function login(username, password, successAction, errorAction) {
      return $http.post(AuthService.getTokenAuthUrl(), {
        username: username,
        password: password
      }).then(loginSuccessFn, loginErrorFn);

      function loginSuccessFn(response, status, headers, config) {
        successAction(response, status, headers, config);
      }

      function loginErrorFn(response, status, headers, config) {
        errorAction(response, status, headers, config);
        // console.log(response.data);
      };
    }

    function logout() {
      AuthService.remove();
    }

    return {
      login: login,
      logout: logout,
    };
  }
])

.factory('User',
  make_resource('users')
)

.factory('Favorite',
  make_resource('favorites', true)
)

.factory('Entry',
  make_resource('entries', true)
)

.factory('Tag',
  make_resource('tags')
)

.factory('Setting',
  make_resource('settings')
)

;
