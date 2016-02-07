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
  '$http',
  function($http, $state) {
    function login(username, password) {
      return $http.post('http://192.168.33.10/api-token-auth/', {
        username: username,
        password: password
      }).then(loginSuccessFn, loginErrorFn);

      function loginSuccessFn(response, status, headers, config) {
        localStorage.setItem('bookmarker.token', response.data.token);
        // window.location = '#/app/main';
      }

      /**
       * @name loginErrorFn
       * @desc Log "Epic failure!" to the console
       */
      function loginErrorFn(data, status, headers, config) {
        console.error('Epic failure!');
      };
    }

    return {
      login: login
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
