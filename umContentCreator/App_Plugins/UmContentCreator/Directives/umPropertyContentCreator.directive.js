angular.module('umbraco').directive('umPropertyContentCreator', [function () {
    return {
        restrict: 'A',
        templateUrl: '/App_Plugins/UmContentCreator/Views/umPropertyContentCreator.html',
        link: function () { }
    };
}]).run(['$compile', '$timeout', '$rootScope', function ($compile, $timeout, $rootScope) {
    const processedElements = new Set();

    function addContentCreator(propertyElement) {
        $timeout(() => {
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

            if (controller) {
                const contentCreatorWrapper = document.createElement('div');
                const formElement = controller.querySelector('ng-form');
                const rte = formElement.querySelector('.umb-rte-editor-con');
                contentCreatorWrapper.setAttribute('um-property-content-creator', '');

                if (rte) {
                    rte.style.width = '100%';
                }

                formElement.style.display = 'flex';
                formElement.style.flexDirection = 'row';
                formElement.style.gap = '10px';

                formElement.appendChild(contentCreatorWrapper);
                $compile(contentCreatorWrapper)($rootScope);

                const mainFormController = angular.element('form[name=contentForm]').controller('form');
                const formController = angular.element(formElement).controller('form');

                if (!formController) {
                    return;
                }

                const parentFormController = formController.$$parentForm;

                if (!parentFormController) {
                    return;
                }

                $timeout(() => {
                    parentFormController.$setPristine();
                    formController.$setPristine();
                    mainFormController.$setPristine();
                });
            }
        }, 500);
    }

    const targetNode = document.querySelector('body');
    const observerConfig = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(addedNode => {
                    if (addedNode.nodeType === Node.ELEMENT_NODE) {
                        const propertyElements = addedNode.querySelectorAll("umb-property");
                        propertyElements.forEach(propertyElement => addContentCreator(propertyElement));
                    }
                });
            }
        }
    });

    observer.observe(targetNode, observerConfig);
}]);