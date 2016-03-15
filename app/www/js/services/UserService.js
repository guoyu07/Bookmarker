angular.module('bookmarker.user.service', [])

.service('UserProfile', function(MappingObject, AuthService, User, Setting, $q, $rootScope) {
  var displayMapping = MappingObject({
    "Detail": "详细",
    "Medium": "默认",
    "Short": "简短"
  });
  var layoutMapping = MappingObject({
    "Wide": "宽",
    "Medium": "默认",
    "Narrow": "窄"
  });

  var userProfile = JSON.parse(localStorage.getItem('bookmarker.user.profile'));

  if (userProfile != null) {
    AuthService.setIsLoggedIn(true);
  }

  return {
    initProfile: function() {
      userProfile = AuthService.decodeToken(AuthService.get());
      localStorage.setItem('bookmarker.user.profile', JSON.stringify(userProfile));
    },
    removeProfile: function() {
      localStorage.removeItem('bookmarker.user.profile');
    },
    getProfile: function() {
      if (!AuthService.isLoggedIn())
        return {
          'username': '未登录'
        };
      return userProfile;
    },
    getLayoutStyle: function(layoutStyle) {
      return layoutMapping.get(layoutStyle);
    },
    getDisplayStyle: function(displayStyle) {
      return displayMapping.get(displayStyle);
    },
    getBmStyle: function(layoutStyle) {
      if (layoutStyle == "Wide") return [2, "col-50"];
      else if (layoutStyle == "Narrow") return [4, "col-25"];
      else return [3, "col-33"];
    },
    setting: function() {
      var deferred = $q.defer();

      User.get({
        id: userProfile.user_id
      }, function(profile) {
        userProfile = profile;
        $rootScope.user = profile;
        localStorage.setItem('bookmarker.user.profile', JSON.stringify(profile));
        Setting.get({
          id: profile.setting
        }, function(setting) {
          deferred.resolve(setting);
        }, function(err) {
          deferred.reject(err);
        });
      }, function() {
        deferred.reject(err);
      });
      return deferred.promise;
    }
  }
});
