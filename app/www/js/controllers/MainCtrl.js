angular.module('bookmarker.main.controller', ['bookmarker.api'])

.controller('MainCtrl', function($scope, $stateParams, $ionicTabsDelegate,
  $rootScope, UserFavorite, UserProfile, UserEntry, UI) {
  // $scope.onSwipeLeft = function() {
  //   var index = $ionicTabsDelegate.selectedIndex();
  //   $ionicTabsDelegate.select((index + 1) % 3);
  // }

  $rootScope.loading = true;

  UserProfile.setting().then(function(results) {
    $rootScope.quickMode = results.quick_mode;
    $rootScope.$emit('bmDisplayChanged', results.display_style);
    var arr = UserProfile.getBmStyle(results.layout_style);
    $rootScope.bmColumns = arr[0];
    $rootScope.bmClass = arr[1];
    UserEntry.query({
      id: UserProfile.getProfile().user_id
    }, function(results) {
      $rootScope.loading = false;
      $rootScope.entries = results;
      $rootScope.$broadcast('entryLoadingCompleted');
    }, function() {
      $rootScope.loading = false;
      UI.toast('加载书签失败');
    });
  }, function() {
    $rootScope.loading = false;
    UI.toast('加载设置失败');
  });

  UserFavorite.query({
    id: UserProfile.getProfile().user_id
  }).$promise.then(function(results) {
    $rootScope.favorites = results;
  });

})
