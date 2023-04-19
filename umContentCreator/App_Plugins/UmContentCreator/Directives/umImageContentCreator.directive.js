angular.module('umbraco').directive('umImageContentCreator', [function () {
    return {
        restrict: 'A',
        templateUrl: '/App_Plugins/UmContentCreator/Views/umImageContentCreator.html',
        link: function () { }
    };
}]).run(['$compile', '$timeout', '$rootScope', function ($compile, $timeout, $rootScope) {
    const processedElements = new Set();

    function addContentCreator(propertyElement) {
        $timeout(() => {
            if (processedElements.has(propertyElement)) {
                return;
            }

            processedElements.add(propertyElement);

            const controller = propertyElement.querySelector(
                '[ng-controller="Umbraco.PropertyEditors.MediaPickerController as vm"]'
            );

            if (controller) {
                const contentCreatorWrapper = document.createElement('div');
                contentCreatorWrapper.setAttribute('um-image-content-creator', '');

                controller.style.display = 'flex';
                controller.style.gap = '5px';
                contentCreatorWrapper.style.border = 'none';
                controller.appendChild(contentCreatorWrapper);
                $compile(contentCreatorWrapper)($rootScope);
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
