angular.module('umbraco').directive('umContentCreator', ['$http', function () {
    return {
        restrict: 'A',
        templateUrl: '/App_Plugins/UmContentCreator/Views/umContentCreator.html',
        link: function (scope, element, attrs) {
            // Add any additional functionality here if required
        }
    };
}]).run(['$timeout', function ($timeout) {
    const processedElements = new Set();

    function addContentCreator(propertyElement) {
        if (processedElements.has(propertyElement)) {
            return;
        }

        processedElements.add(propertyElement);

        const propertyEditor = propertyElement.querySelector(
            '[ng-controller="Umbraco.PropertyEditors.textboxController"], [ng-controller="Umbraco.PropertyEditors.textAreaController"], [ng-controller="Umbraco.PropertyEditors.RTEController"]'
        );

        if (propertyEditor && !propertyEditor.querySelector('.um-content-creator')) {
            const contentCreatorWrapper = document.createElement('div');
            contentCreatorWrapper.setAttribute('um-content-creator', '');
            propertyEditor.appendChild(contentCreatorWrapper);

            const $scope = angular.element(propertyElement).scope();
            const $compile = angular.element(propertyElement).injector().get("$compile");
            $compile(contentCreatorWrapper)($scope);

            $timeout(() => {
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }, 0);
        }
    }
    
    setTimeout(() => {
        const propertyElements = document.querySelectorAll("umb-property");
        propertyElements.forEach(addContentCreator);
    }, 2000);
    
    setInterval(() => {
        const propertyElements = document.querySelectorAll("umb-property");
        propertyElements.forEach(addContentCreator);
    }, 200);
}]);