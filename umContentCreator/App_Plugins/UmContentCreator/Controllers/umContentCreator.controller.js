angular.module('umbraco').controller('UmContentCreatorController',
    function ($scope, $http, $routeParams, contentResource, notificationsService, editorState) {
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
        $scope.contentId = parseInt($routeParams.id, 10);
        $scope.getPropertiesUrl = "/umbraco/api/UmContentCreator/GetProperties";
        $scope.getGeneratedTextUrl = "/umbraco/api/UmContentCreator/GetGeneratedText";
        $scope.updateNestedPropertyUrl = "/umbraco/api/UmContentCreator/UpdateNestedProperty";
        
        $scope.init = function () {
            if (!$routeParams.section || $routeParams.section !== 'content' || isNaN($scope.contentId)) {
                return;
            }
            
            $http.get($scope.getPropertiesUrl, {params: {contentId: $scope.contentId}})
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

            const content = editorState.current;
            const variant = content.variants[0];
            const properties = variant.tabs.flatMap(t => t.properties);

            const propertyToUpdate = findProperty(properties, $scope.selectedProperty.propertyAlias);
            
            if (!propertyToUpdate) {
                notificationsService.error('Error', 'Failed to find the property to update.');
                return;
            }

            $scope.isGenerating = true;

            $http.post($scope.getGeneratedTextUrl, {
                prompt: $scope.prompt,
                maxTokens: $scope.selectedTokens,
                temperature: $scope.selectedTemperature,
                propertyEditorAlias: $scope.selectedProperty.propertyEditorAlias
            }).then(function (response) {
                if (propertyToUpdate.editor === "Umbraco.NestedContent") {
                    $http.post($scope.updateNestedPropertyUrl, {
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
                } else {
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


        function findProperty(properties, propertyAlias) {
            for (const property of properties) {
                if (property?.alias === propertyAlias) {
                    return property;
                }
                
                if (property.editor === "Umbraco.NestedContent") {
                    return property;
                }
            }
            return null;
        }

        $scope.init();
    });