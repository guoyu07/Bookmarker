angular.module('bookmarker.setting.controller', ['bookmarker.api'])

.controller('SettingCtrl', function($scope, $stateParams, $rootScope, Setting, UserProfile, UI) {
  var setting = null;

  UserProfile.setting().then(function(results) {
    setting = results;
    $scope.displayStyle = UserProfile.getDisplayStyle(results.display_style);
    $scope.layoutStyle = UserProfile.getLayoutStyle(results.layout_style);
  });

  $scope.updateSetting = function() {
    Setting.update({
      id: setting.id
    }, setting, function() {}, function() {
      UI.toast("修改失败");
    });
  }

  $scope.changeDisplayStyle = function(displayStyle) {
    var ds = UserProfile.getDisplayStyle(displayStyle);
    setting.display_style = ds;
    $rootScope.$emit('bmDisplayChanged', ds);

    $scope.updateSetting();
  }

  $scope.changeLayoutStyle = function(layoutStyle) {
    var ls = UserProfile.getLayoutStyle(layoutStyle);
    setting.layout_style = ls;
    $rootScope.$emit('bmLayoutChanged', ls);

    $scope.updateSetting();
  }

  $scope.changeQuickMode = function(quickMode) {
    $rootScope.quickMode = quickMode;
    setting.quick_mode = quickMode;

    $scope.updateSetting();
  }

});
