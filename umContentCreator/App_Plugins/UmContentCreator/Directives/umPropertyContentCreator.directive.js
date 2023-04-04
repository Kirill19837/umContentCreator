angular.module('umbraco').directive('umContentCreator', ['$http', function () {
    return {
        restrict: 'A',
        templateUrl: '/App_Plugins/UmContentCreator/Views/umContentCreator.html',
        link: function (scope, element, attrs) {
        }
    };
}]).run(function () {
    const processedElements = new Set();

    function addContentCreator(propertyElement) {
        if (processedElements.has(propertyElement)) {
            return;
        }

        let parentWithMultipleTextBoxController = propertyElement.closest('[ng-controller="Umbraco.PropertyEditors.MultipleTextBoxController"]');

        if (parentWithMultipleTextBoxController) {
            return;
        }

        processedElements.add(propertyElement);

        const controller = propertyElement.querySelector(
            '[ng-controller="Umbraco.PropertyEditors.textboxController"], [ng-controller="Umbraco.PropertyEditors.textAreaController"], [ng-controller="Umbraco.PropertyEditors.RTEController"]'
        );

        if (controller && !controller.querySelector('.um-content-creator')) {
            const contentCreatorWrapper = document.createElement('div');
            const formElement = controller.querySelector('ng-form');
            const rte = formElement.querySelector('.umb-rte-editor-con');
            contentCreatorWrapper.setAttribute('um-content-creator', '');

            if (rte) {
                rte.style.width = '100%';
            }
            formElement.style.display = 'flex';
            formElement.style.flexDirection = 'row';
            formElement.style.gap = '10px';

            formElement.appendChild(contentCreatorWrapper);

            const $scope = angular.element(propertyElement).scope();
            const $compile = angular.element(propertyElement).injector().get("$compile");
            $compile(contentCreatorWrapper)($scope);

            $scope.$apply();
        }
    }

    setInterval(() => {
        const propertyElements = document.querySelectorAll("umb-property");
        propertyElements.forEach(addContentCreator);
    }, 500);
});
