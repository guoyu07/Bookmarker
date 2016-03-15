angular.module('bookmarker.favorite.controller', ['bookmarker.api'])

.controller('FavoriteCtrl', function($scope, $stateParams, $rootScope, Favorite, UserFavorite, Entry,
  UserProfile, chunk, $ionicModal, $ionicPopup, UI, $ionicListDelegate) {
  $scope.newFavor = {};
  $scope.createMode = false;

  var popUpOptions = {
    template: '<input type="text" maxlength="32" ng-model="newFavor.name">'+
    '<ion-checkbox style="border-width:0;padding:8px 16px 8px 60px;margin-top:10px;" ng-model="newFavor.isPublic" ng-show="createMode">公开</ion-checkbox>',
    title: '输入收藏夹名称',
    scope: $scope,
    buttons: [{
      text: '取消'
    }, {
      text: '<b>保存</b>',
      type: 'button-calm',
      onTap: function(e) {
        if (!$scope.newFavor.name) {
          e.preventDefault();
        } else {
          return $scope.newFavor;
        }
      }
    }, ]
  };

  $ionicModal.fromTemplateUrl('templates/favor.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.closeModal = function() {
    $scope.modal.hide();
  }

  $scope.addFavorite = function() {
    $scope.newFavor.name = "";
    $scope.createMode = true;
    var myPopup = $ionicPopup.show(popUpOptions);
    myPopup.then(function(favor) {
      if (favor.name) {
        var favor = new Favorite({
          name: favor.name,
          is_public: favor.isPublic || false
        });
        favor.$save(function(favor) {
          $rootScope.favorites.push(favor);
        }, function() {
          UI.toast('添加失败');
        });
      }
    });
  };

  $scope.editFavorite = function(favor) {
    $scope.newFavor.name = favor.name;
    $scope.createMode = false;
    var myPopup = $ionicPopup.show(popUpOptions);
    myPopup.then(function(newFavor) {
      if (newFavor.name) {
        favor.name = newFavor.name;
        Favorite.update({
          id: favor.id
        }, favor, function() {
          var index = $rootScope.favorites.indexOf(favor);
          $rootScope.favorites[index].name = newFavor.name;
        }, function() {
          UI.toast('更新失败');
        });
      }
    });
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.removeFavorite = function(favor) {
    Favorite.remove({
      id: favor.id
    }, function() {
      $rootScope.favorites.splice($rootScope.favorites.indexOf(favor), 1);
      UI.toast('删除成功');
    }, function() {
      UI.toast('删除失败');
    });
  }

  $scope.showFavorite = function(id) {
    Favorite.get({
      id: id
    }, function(results) {
      $scope.favor = results;
      $scope.favorites = chunk(results.entries, 3);
      $scope.modal.show();
    })
  }
});
