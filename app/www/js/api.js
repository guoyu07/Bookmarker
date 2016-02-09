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
      get: {headers: headers},
      save: {headers: headers},
      remove: {headers: headers},
      delete: {headers: headers},
    });
  }
}

angular.module('bookmarker.api', ['ngResource'])

.factory('Authentication', [
  '$http', '$state', 'authToken', 'UI',
  function($http, $state, authToken, UI) {
    function login(username, password) {
      return $http.post(authToken.getTokenAuthUrl(), {
        username: username,
        password: password
      }).then(loginSuccessFn, loginErrorFn);

      function loginSuccessFn(response, status, headers, config) {
        authToken.save(response.data.token);
        $state.go('app.main');
      }

      function loginErrorFn(response, status, headers, config) {
        UI.toast('登录失败');
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
