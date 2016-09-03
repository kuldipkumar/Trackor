angular.module('ticket').directive('ngOnFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.broadcastEventName ? attr.broadcastEventName : 'ngRepeatFinished');
                });
            }
        }
    };
});