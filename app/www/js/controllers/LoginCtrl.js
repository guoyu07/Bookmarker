angular.module('bookmarker.login.controller', ['bookmarker.api'])

.controller('LoginCtrl', function($scope, $stateParams, $http, $rootScope, $state, $ionicModal, AuthService,
  API_HOST, Authentication, User, Setting, UserProfile, UI) {
  $scope.register = {};
  $scope.registerErrMsgs = {};

  $ionicModal.fromTemplateUrl('templates/register.html', {
    scope: $scope,
    animation: 'fadeIn'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.login = function(isValid) {
    if (isValid) {
      $scope.doLogin($scope.username, $scope.password, $scope.rememberMe == true);
    }
  }

  $scope.doLogin = function(username, password, rememberMe) {
    Authentication.login(username, password, function(response, status, headers, config) {
      var token = response.data.token;
      AuthService.save(token);
      UserProfile.initProfile();
      $scope.$emit('userLogging');
    }, function(response, status, headers, config) {
      UI.toast('登录失败');
    });
    localStorage.setItem('rememberMe', rememberMe);
  }

  $scope.openRegister = function() {
    $scope.registerErrMsgs = {};
    $scope.modal.show();
  }

  $scope.cancelRegister = function() {
    $scope.modal.hide();
  }

  $scope.register = function(isValid) {
    if (isValid) {
      $http.post(API_HOST + '/sign-up/', {
        username: $scope.register.username,
        password: $scope.register.password,
        email: $scope.register.email
      }).success(function(response) {
        console.log(response);
        $scope.doLogin($scope.register.username, $scope.register.password, false);
        $scope.modal.hide();
      }).error(function(response) {
        $scope.registerErrMsgs = response;
      });


    }
  }

  $scope.logout = function() {
    Authentication.logout();
    UserProfile.removeProfile();
    $state.go('app.login');
  }

});
