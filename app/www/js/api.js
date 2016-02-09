function make_resource(path) {
  return function($resource, API_URL) {
    return {
      query: function(api_token) {
        return $resource(API_URL + '/'+ path +'/:id', {
          id: '@id'
        }, {
          query: {
            method: 'GET',
            isArray: true,
            headers: {
              'Authorization': 'JWT ' + api_token
            }
          }
        }).query();
      }
    }
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

.factory('User', [
  '$resource',
  make_resource('users')
])

.factory('Favorite', [
  '$resource', 'API_URL',
  make_resource('favorites')
])

.factory('Entry', [
  '$resource',
  make_resource('entries')
])

.factory('Tag', [
  '$resource', 'API_URL',
  make_resource('tags')
])

.factory('Setting', [
  '$resource', 'API_URL', 'make_resource',
  make_resource('settings')
])

;
