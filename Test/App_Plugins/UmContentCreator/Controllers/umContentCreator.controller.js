angular.module('umbraco').controller('UmContentCreatorController',
    function ($scope, $http, $routeParams, contentResource, notificationsService, editorState) {
        $scope.properties = [];
        $scope.selectedProperty = null;
        $scope.selectedTokens = 100;
        $scope.selectedTemperature = 0.7;
        $scope.isGenerating = false;
        $scope.prompt = '';
        $scope.contentId = parseInt($routeParams.id, 10);
        $scope.getPropertiesUrl = "/umbraco/api/UmContentCreator/GetProperties";
        $scope.getGeneratedTextUrl = "/umbraco/api/UmContentCreator/GetGeneratedText";
        
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

        $scope.generate = function () {
            if (!$scope.selectedProperty || !$scope.prompt) {
                return;
            }

            $scope.isGenerating = true;
            
            const content = editorState.current;
            const variant = content.variants[0];
            const propertyToUpdate = variant.tabs[0].properties.find(function (property) {
                return property.alias === $scope.selectedProperty.propertyAlias;
            });

            if (!propertyToUpdate) {
                notificationsService.error('Error', 'Failed to find the property to update.');
                return;
            }

            $http.post($scope.getGeneratedTextUrl, {
                prompt: $scope.prompt,
                maxTokens: $scope.selectedTokens,
                temperature: $scope.selectedTemperature
            }).then(function (response) {
                propertyToUpdate.value = response.data;
                $scope.isGenerating = false;
                contentResource.save(content, false, [])
                    .then(function () {})
                    .catch(function () {
                        $scope.isGenerating = false;
                        notificationsService.error('Error', 'Failed to update property value.');
                });
            }).catch(function () {
                notificationsService.error('Error', 'Failed to update property value.');
            });
        };


        $scope.init();
    });