angular.module('umbraco').controller('UmContentCreatorController',
    function ($scope, $http, $routeParams, contentResource, notificationsService, editorState, umContentCreatorService) {
        $scope.configurationObject = umContentCreatorService.getInitialValues();
        $scope.properties = [];

        $scope.init = function () {
            if ($routeParams.section === 'content' && !!$routeParams.create || $routeParams.section === 'settings') {
                return;
            }

            const { content, properties } = umContentCreatorService.getPropertiesAndContent(editorState);
            let contentTypeKey = content.contentTypeKey;
            let activeBlockListItem = umContentCreatorService.getActiveBlockListItem(properties);

            if (activeBlockListItem) {
                contentTypeKey = activeBlockListItem.data.contentTypeKey;
            }

            umContentCreatorService.getProperties(contentTypeKey)
                .then(function (response) {
                    $scope.properties = response.data;
                })
                .catch(function () {
                    notificationsService.error('Error', 'Failed to load properties.');
                });
        };

        $scope.getTemperatureLabel = function (temperatureValue) {
            return $scope.configurationObject.temperatureLabels[temperatureValue];
        };

        $scope.generate = function () {
            if (!$scope.configurationObject.selectedProperty || !$scope.configurationObject.prompt) {
                return;
            }

            const { content, properties } = umContentCreatorService.getPropertiesAndContent(editorState);

            const propertyToUpdate = umContentCreatorService.findProperty(properties, $scope.configurationObject.selectedProperty.propertyAlias);

            if (!propertyToUpdate) {
                notificationsService.error('Error', 'Failed to find the property to update.');
                return;
            }

            $scope.configurationObject.isGenerating = true;

            umContentCreatorService.getGeneratedText({
                prompt: $scope.configurationObject.prompt,
                maxTokens: $scope.configurationObject.selectedTokens,
                temperature: $scope.configurationObject.selectedTemperature,
                propertyEditorAlias: $scope.configurationObject.selectedProperty.propertyEditorAlias
            }).then(function (response) {
                const generatedText = response.data;
                const selectedPropertyAlias = $scope.configurationObject.selectedProperty.propertyAlias;
                switch (propertyToUpdate.editor) {
                    case "Umbraco.NestedContent": {
                        $scope.configurationObject.isGenerating = umContentCreatorService.updatePropertyInNestedContent(content, selectedPropertyAlias, generatedText);
                        break;
                    }
                    case "Umbraco.BlockList": {
                        $scope.configurationObject.isGenerating = umContentCreatorService.updatePropertyInBlockListItem(content, selectedPropertyAlias, propertyToUpdate, generatedText);
                        break;
                    }
                    default: {
                        $scope.configurationObject.isGenerating = umContentCreatorService.updatePropertyInContent(propertyToUpdate, generatedText, content);
                        break;
                    }
                }
            }).catch(function () {
                notificationsService.error('Error', 'Failed to update property value.');
            });
        };

        $scope.init();
    });