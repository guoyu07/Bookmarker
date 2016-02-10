function make_resource(path, isArray) {
  return function($resource, authToken, API_URL) {
    var headers = {'Authorization': 'JWT ' + authToken.get()}
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
  '$http', '$state', 'authToken',
  function($http, $state, authToken) {
    function login(username, password, successAction, errorAction) {
      return $http.post(authToken.getTokenAuthUrl(), {
        username: username,
        password: password
      }).then(loginSuccessFn, loginErrorFn);

      function loginSuccessFn(response, status, headers, config) {
        authToken.save(response.data.token);
        if(typeof(successAction) == 'function') successAction(response, status, headers, config);
      }

      function loginErrorFn(response, status, headers, config) {
        if(typeof(errorAction) == 'function') errorAction(response, status, headers, config);
        // console.log(response.data);
      };
    }

    function logout() {
      authToken.remove();
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
