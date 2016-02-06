angular.module('bookmarker.api', ['ngResource'])

.factory('User', [
  '$resource', function($resource) {
    return $resource('/api/users/:id', {
      username: '@id'
    });
  }
])

.factory('Favorite', [
  '$resource', function($resource) {
    return $resource('http://192.168.33.10:8000/api/favorites/:id', {
      id: '@id'
    });
  }
])

;
