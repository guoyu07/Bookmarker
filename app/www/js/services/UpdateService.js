angular.module('bookmarker.update.service', [])

.factory('UpdateService', function($http, $cordovaAppVersion, $ionicPopup, $timeout, $ionicLoading,
  $cordovaFileTransfer, $cordovaFileOpener2, UI, $window) {

  var Update = {
    check: function(view) {
      if (!$window.cordova) {
        return;
      }
      var url = 'http://ivwsyygyfnhv-lbm.daoapp.io/static/version.json/';
      $http.get(url).success(function(res) {
        var serveAppVersion = res.version;
        if ($cordovaAppVersion === undefined) {
          return;
        }
        $cordovaAppVersion.getVersionNumber().then(function(version) {
          if (parseFloat(version) < parseFloat(serveAppVersion)) {
            showUpdateConfirm(res);
          } else {
            if (view !== 'main') {
              UI.toast('当前版本是最新的');
            }
          }
        });
      }).error(function(response) {
        UI.toast('更新失败');
      });
    }
  };
  var showUpdateConfirm = function(data) {
    var confirmPopup = $ionicPopup.confirm({
      title: '升级到最新版本：v' + data.version,
      template: data.info,
      cancelText: '取消',
      okText: '升级'
    });
    confirmPopup.then(function(res) {
      if (res) {
        $ionicLoading.show({
          template: "已经下载：0%"
        });

        var url = 'http://ivwsyygyfnhv-lbm.daoapp.io/static/Lightbm.apk/';
        var targetPath = '/sdcard/Download/Lightbm.apk';
        var trustHosts = true;
        var options = {};

        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function(result) {
          $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(function() {
          }, function(err) {
            alert(err);
          });
          $ionicLoading.hide();
        }, function(err) {
          alert(err);
          $ionicLoading.hide();
        }, function(progress) {
          var downloadProgress;
          $timeout(function() {
            downloadProgress = (progress.loaded / progress.total) * 100;
            $ionicLoading.show({
              template: '已经下载：' + Math.floor(downloadProgress) + '%'
            });
            if (downloadProgress > 99) {
              $ionicLoading.hide();
            }
          })
        });
      }
    });
  };
  return Update;
});
