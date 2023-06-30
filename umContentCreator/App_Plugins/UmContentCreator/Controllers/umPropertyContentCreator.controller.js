angular.module('umbraco').controller('UmPropertyContentCreatorController',
    function ($scope, umPropertyContentCreatorService, notificationsService, modalService, propertyContentService) {
        $scope.configurationObject = null;

        $scope.openModal = (event) => {
            event.stopPropagation();
            event.preventDefault();

            $scope.configurationObject = umPropertyContentCreatorService.getInitialValues();
            $scope.configurationObject.modalCaptionText = propertyContentService.setSelectedProperty(event);
            $scope.configurationObject.propertyHasValue = propertyContentService.checkIfPropertyHasValue();

            if (typeof event.target === 'undefined' || event.target === null) {
                return;
            }

            modalService.openModal(event);
        };

        $scope.closeModal = () => {
            modalService.closeModal();
            $scope.configurationObject = umPropertyContentCreatorService.getInitialValues();
        }

        $scope.getTemperatureLabel = function (temperatureValue) {
            if (!$scope.configurationObject?.temperatureLabels) {
                return;
            }
            return $scope.configurationObject?.temperatureLabels[temperatureValue];
        };

        $scope.generateText = (event) => {
            event.stopPropagation();
            event.preventDefault();
            $scope.configurationObject.generatedText = null;

            if (!$scope.configurationObject.generationModel.prompt) {
                return;
            }
            
            const propertyEditorAlias = propertyContentService.getPropertyEditorAlias();
            $scope.configurationObject = umPropertyContentCreatorService.getGeneratedText($scope.configurationObject.generationModel, propertyEditorAlias);
        };

        $scope.updateContentOfProperty = (event, replace) => {
            event.stopPropagation();
            event.preventDefault();
            
            const generatedText = $scope.configurationObject.generatedText;
            propertyContentService.updateContentOfProperty(replace, generatedText)
                .then(function (propertyEditor) {
                    propertyContentService.updateContentInDOM(replace, propertyEditor, generatedText);
                    $scope.closeModal();
                    $scope.configurationObject = umPropertyContentCreatorService.getInitialValues();
                })
                .catch(function (error) {
                    notificationsService.error(error);
                });
        }
    });
