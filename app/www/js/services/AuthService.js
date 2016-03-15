angular.module('bookmarker.auth.service', [])

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
});
