angular.module('bookmarker.bookmark.controller', ['bookmarker.api', 'ngTagsInput', 'ngClipboard'])

.config(['ngClipProvider', function(ngClipProvider) {
  ngClipProvider.setPath("lib/zeroclipboard/dist/ZeroClipboard.swf");
}])

.filter('favicon', function() {
  return function(url) {
    // return 'http://data.scrapelogo.com/'+ url +'/logo'
    return 'http://grabicon.com/icon?domain=' + url + '&size=64'
  }
})

.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, $filter, $ionicModal, $ionicPopover,
  $ionicListDelegate, $cordovaSocialSharing, ClipboardService, Entry, UserEntry, chunk, UserProfile,
  $cordovaInAppBrowser, EntryTag, Tag, API_URL, UI) {
  $scope.chunks = [];
  $scope.displayMode = 1;
  $scope.loading = true;
  $scope.newEntry = {};
  $scope.deatailEntry = {};
  $scope.createMode = true; // false if updateMode
  $scope.selectedEntry = null;
  $scope.priorityOptions = [{
    val: '1',
    name: "高"
  }, {
    val: '0',
    name: "默认"
  }, {
    val: '-1',
    name: "低"
  }];

  $scope.openBrowser = function(url, inSystem) {
    if (!$rootScope.isCordova) {
      window.open(url);
    } else {
      var target = '_blank';
      if (inSystem == true)
        target = '_system'
      $cordovaInAppBrowser.open(url, target, {
        location: 'yes',
        clearcache: 'yes',
        toolbar: 'no'
      }).then(function(event) {
        // success
      })
      .catch(function(event) {
        UI.toast('加载失败');
      });
    }
  }

  $ionicModal.fromTemplateUrl('templates/edit.html', {
    scope: $scope,
    animation: 'jelly'
  }).then(function(modal) {
    $scope.bmModal = modal;
  });

  $ionicPopover.fromTemplateUrl('templates/options.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $ionicModal.fromTemplateUrl('templates/detail.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.dtModal = modal;
  });

  // $scope.loadTags = function(entry) {
  //
  // }

  $scope.showOptions = function($event, entry) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.deatailEntry = entry;
    // ActionSheet?
    $scope.popover.show($event);
  }

  $scope.showDetail = function(entry) {
    $scope.dtModal.show();
  }

  $scope.$on('$destroy', function() {
    $scope.bmModal.remove();
    $scope.popover.remove();
  });

  $scope.quickAdd = function(isValid) {
    if (isValid) {
      var entry = new Entry({
        title: '$qa',
        url: $scope.newEntry.qucikUrl,
        priority: 0,
        belong: $rootScope.user.default_favor.toString(),
        tags: []
      });
      entry.$save(function(entry, putResponseHeaders) {
        $rootScope.entries.push(entry);
        $scope.loadEntries();
        $scope.newEntry.qucikUrl = "";
      }, function() {
        UI.toast('添加失败');
      });
    }
  }

  $scope.shareEntry = function(entry) {
    $cordovaSocialSharing
    .share(entry.remark, entry.title, null, entry.url)
    .then(function(result) {

    }, function(err) {

    });
  }

  $scope.copyEntryLink = function(url) {
    if ($rootScope.isCordova) {
      ClipboardService.copy(url).then(function(){
        $scope.popover.hide();
        UI.toast('复制成功', 'short');
      }, function(){
        UI.toast('复制失败', 'short');
      });
    } else {
      alert('已复制到黏贴版');
    }
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.submitEntry = function(entryForm) {
    if($scope.newEntry.tags) {
      $scope.newEntry.tags = $scope.newEntry.tags.map(function(tag) {
        return new Tag({
          name: tag.name
        });
      });
    } else {
      $scope.newEntry.tags = [];
    }
    var isValid = entryForm.$valid;
    if (isValid) {
      if ($scope.createMode == true)
        $scope.addEntry();
      else
        $scope.updateEntry();
      entryForm.$submitted = false;
    }
  }

  $scope.addEntry = function() {
    var entry = new Entry({
      title: $scope.newEntry.title,
      url: $scope.newEntry.url,
      remark: $scope.newEntry.remark,
      priority: $scope.newEntry.priority || 0,
      belong: $scope.newEntry.belong,
      tags: $scope.newEntry.tags
    });
    entry.$save(function(entry, putResponseHeaders) {
      $rootScope.entries.push(entry);
      $scope.loadEntries();
      $scope.bmModal.hide();
    }, function() {
      UI.toast('添加失败');
    });
  }

  $scope.updateEntry = function() {
    if ($scope.selectedEntry != null) {
      var found = $filter('filter')($rootScope.favorites, {id: parseInt($scope.newEntry.belong)}, true);
      if (found.length) {
        $scope.newEntry.is_public = found[0].is_public;
      }
      angular.extend($scope.selectedEntry, $scope.newEntry);
      Entry.update({
        id: $scope.selectedEntry.id
      }, $scope.selectedEntry, function() {
        var index = $rootScope.entries.map(function(x) {
          return x.id;
        }).indexOf($scope.selectedEntry.id);
        $scope.selectedEntry.priority = parseInt($scope.selectedEntry.priority);
        $rootScope.entries[index] = $scope.selectedEntry;
        $scope.loadEntries();
        $scope.closeModal();
      }, function() {
        UI.toast('更新失败');
      });
    } else {
      UI.toast('更新失败');
    }
    $ionicListDelegate.closeOptionButtons();
  }

  $scope.editEntry = function(entryId) {
    $scope.createMode = false;
    var found = $filter('filter')($rootScope.entries, {
      id: entryId
    }, true);
    if (found.length) {
      $scope.selectedEntry = found[0];
      $scope.newEntry.title = $scope.selectedEntry.title;
      $scope.newEntry.url = $scope.selectedEntry.url;
      $scope.newEntry.remark = $scope.selectedEntry.remark;
      $scope.newEntry.priority = $scope.selectedEntry.priority.toString();
      $scope.newEntry.belong = $scope.selectedEntry.belong.toString();

      EntryTag.query({id: $scope.selectedEntry.id}, function(result) {
        console.log(result);
        $scope.newEntry.tags = result;
      });
    }
    $scope.popover.hide();
    $scope.bmModal.show();
  }

  $scope.removeEntry = function(entry) {
    Entry.remove({
      id: entry.id
    }, function() {
      $rootScope.entries.splice($rootScope.entries.indexOf(entry), 1);
      $scope.loadEntries();
    }, function() {
      UI.toast('删除失败');
    });
    $ionicListDelegate.closeOptionButtons();
    $scope.popover.hide();
  }

  $scope.showCreateModal = function() {
    $scope.createMode = true;
    $scope.newEntry = {};
    $scope.newEntry.priority = "0";
    if ($rootScope.user.default_favor)
      $scope.newEntry.belong = $rootScope.user.default_favor.toString();
    $scope.bmModal.show();
  }

  $scope.closeModal = function() {
    $scope.bmModal.hide();
    $scope.dtModal.hide();
  }

  $scope.loadEntries = function() {
    $scope.chunks = chunk($filter('orderBy')($rootScope.entries, '-priority', false), $rootScope.bmColumns);
  }

  $scope.doRefresh = function() {
    $scope.loadEntries();
    $rootScope.$broadcast('scroll.refreshComplete');
  }

  $scope.$on('entryLoadingCompleted', function() {
    $scope.loadEntries();
  });

  $rootScope.$on('bmAddModeChanged', function(e, isOpen) {

  });

  $rootScope.$on('bmLayoutChanged', function(e, layoutStyle) {
    arr = UserProfile.getBmStyle(layoutStyle);
    $scope.chunks = chunk($rootScope.entries, arr[0]);
    $scope.bmClass = arr[1];
  });

  $rootScope.$on('bmDisplayChanged', function(e, displayStyle) {
    if (displayStyle == "Detail") $scope.displayMode = 2;
    else if (displayStyle == "Short") $scope.displayMode = 0;
    else $scope.displayMode = 1;
  });

});
