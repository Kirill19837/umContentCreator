angular.module('umbraco').run(['$timeout', '$http', function ($timeout, $http) {

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
            $http.get("/App_Plugins/UmContentCreator/Views/umContentCreator.html").then((response) => {
                const contentCreatorHtml = response.data;
                const contentCreatorElement = document.createElement("div");
                contentCreatorElement.innerHTML = contentCreatorHtml.trim();

                propertyEditor.appendChild(contentCreatorElement);

                const $scope = angular.element(propertyElement).scope();
                const $compile = angular.element(propertyElement).injector().get("$compile");
                $compile(contentCreatorElement)($scope);

                $timeout(() => {
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }, 0);
            });
        }
    }

    setInterval(() => {
        const propertyElements = document.querySelectorAll("umb-property");
        propertyElements.forEach(addContentCreator);
    }, 1000);
}]);
