var app = angular.module('bookmarker.app.api', ['ngResource']);

app.factory('User', [
  '$resource', function($resource) {
    return $resource('/api/users/:username', {
      username: '@username'
    });
  }
]);
