angular.module('umbraco').directive('uniqueId', function () {
    let idCounter = 0;
    return {
        restrict: 'A',
        link: function (scope, element) {
            idCounter += 1;
            element.attr('unique-Id', idCounter);
        },
    };
});