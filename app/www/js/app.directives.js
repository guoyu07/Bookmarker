angular.module('bookmarker.directives', [])

.directive('ngRightClick', function($parse) {
  return function(scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick);
    element.bind('contextmenu', function(event) {
      scope.$apply(function() {
        event.preventDefault();
        fn(scope, {
          $event: event
        });
      });
    });
  };
})

.directive('clickForOptions', ['$ionicGesture', function($ionicGesture) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $ionicGesture.on('hold', function(e) {
        var content = element[0].querySelector('.item-content');
        var buttons = element[0].querySelector('.item-options');

        if (!buttons) {
          return;
        }
        var buttonsWidth = buttons.offsetWidth;

        ionic.requestAnimationFrame(function() {
          content.style[ionic.CSS.TRANSITION] = 'all ease-out .25s';

          if (!buttons.classList.contains('invisible')) {
            content.style[ionic.CSS.TRANSFORM] = '';
            setTimeout(function() {
              buttons.classList.add('invisible');
            }, 250);
          } else {
            buttons.classList.remove('invisible');
            content.style[ionic.CSS.TRANSFORM] = 'translate3d(-' + buttonsWidth + 'px, 0, 0)';
          }
        });

      }, element);
    }
  };
}]);
