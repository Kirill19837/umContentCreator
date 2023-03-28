angular.module('umbraco').controller('UmContentCreatorController',
    function ($scope, $http, $routeParams, contentResource, notificationsService, editorState, propertiesService) {
        $scope.properties = [];
        $scope.selectedProperty = null;
        $scope.selectedTokens = 50;
        $scope.selectedTemperature = 0.6;
        $scope.temperatureLabels = {
            0.2: 'Conservative',
            0.4: 'Cautious',
            0.6: 'Balanced',
            0.8: 'Creative',
            1.0: 'Adventurous'
        };
        $scope.isGenerating = false;
        $scope.prompt = '';
        $scope.getPropertiesUrl = "/umbraco/api/UmContentCreator/GetProperties";
        $scope.getGeneratedTextUrl = "/umbraco/api/UmContentCreator/GetGeneratedText";
        $scope.updateNestedPropertyUrl = "/umbraco/api/UmContentCreator/UpdateNestedProperty";

        $scope.init = function () {
            if ($routeParams.section === 'content' && !!$routeParams.create || $routeParams.section === 'settings') {
                return;
            }

            const { content, properties } = propertiesService.getPropertiesAndContent(editorState);
            let contentTypeKey = content.contentTypeKey;
            let activeBlockListItem = propertiesService.getActiveBlockListItem(properties);

            if (activeBlockListItem) {
                contentTypeKey = activeBlockListItem.data.contentTypeKey;
            }

            propertiesService.getProperties(contentTypeKey)
                .then(function (response) {
                    $scope.properties = response.data;
                })
                .catch(function () {
                    notificationsService.error('Error', 'Failed to load properties.');
                });
        };

        $scope.getTemperatureLabel = function (temperatureValue) {
            return $scope.temperatureLabels[temperatureValue];
        };

        $scope.generate = function () {
            if (!$scope.selectedProperty || !$scope.prompt) {
                return;
            }

            const { content, properties } = propertiesService.getPropertiesAndContent(editorState);

            const propertyToUpdate = propertiesService.findProperty(properties, $scope.selectedProperty.propertyAlias);
            
            if (!propertyToUpdate) {
                notificationsService.error('Error', 'Failed to find the property to update.');
                return;
            }

            $scope.isGenerating = true;

            propertiesService.getGeneratedText({
                prompt: $scope.prompt,
                maxTokens: $scope.selectedTokens,
                temperature: $scope.selectedTemperature,
                propertyEditorAlias: $scope.selectedProperty.propertyEditorAlias
            }).then(function (response) {
                if (propertyToUpdate.editor === "Umbraco.NestedContent") {
                    propertiesService.updateNestedProperty({
                        contentId: content.id,
                        propertyAlias: $scope.selectedProperty.propertyAlias,
                        value: response.data
                    }).then(function () {
                        $scope.isGenerating = false;
                        location.reload();
                    }).catch(function () {
                        $scope.isGenerating = false;
                        notificationsService.error('Error', 'Failed to update nested property value.');
                    });
                } if (propertyToUpdate.editor === "Umbraco.BlockList") {
                    propertyToUpdate[$scope.selectedProperty.propertyAlias] = response.data;
                    $scope.isGenerating = false;

                    contentResource.save(content, false, [])
                        .then(function () {
                            location.reload();
                        })
                        .catch(function () {
                            $scope.isGenerating = false;
                            notificationsService.error('Error', 'Failed to update property value.');
                        });
                }
                else {
                    propertyToUpdate.value = response.data;
                    $scope.isGenerating = false;
                    contentResource.save(content, false, [])
                        .then(function () {})
                        .catch(function () {
                            $scope.isGenerating = false;
                            notificationsService.error('Error', 'Failed to update property value.');
                        });
                }
            }).catch(function () {
                notificationsService.error('Error', 'Failed to update property value.');
            });
        };
        
        $scope.init();
    });