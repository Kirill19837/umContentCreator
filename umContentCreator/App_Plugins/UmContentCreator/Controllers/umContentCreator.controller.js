angular.module('umbraco').controller('UmContentCreatorController',
    function ($scope, $http, $routeParams, contentResource, notificationsService, editorState, umContentCreatorService) {
        $scope.configurationObject = umContentCreatorService.getInitialValues();
        
        const modal = document.getElementById("um-content-creator-modal");
        const navigation = document.getElementById("navigation");
        
        $scope.openModal = (event) => {
            event.stopPropagation();
            event.preventDefault();

            umContentCreatorService.setSelectedProperty(event);
            
            navigation.classList.add("ng-hide");
            modal.style.display = "block";
            
            window.onclick = function (event) {
                if (!isDescendant(modal, event.target) && event.target !== modal && event.target.id !== "openModalButton") {
                    modal.style.display = "none";
                }
            };
        };
        
        const isDescendant = (parent, child) => {
            let node = child.parentNode;
            while (node !== null) {
                if (node === parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }
        
        $scope.closeModal = () => {
            navigation.classList.remove("ng-hide");
            modal.style.display = "none";
        }
        
        $scope.getTemperatureLabel = function (temperatureValue) {
            return $scope.configurationObject?.temperatureLabels[temperatureValue];
        };

        $scope.generateText = (event) => {
            event.stopPropagation();
            event.preventDefault();
            
            if (!$scope.configurationObject.generationModel.prompt) {
                return;
            }
            
            umContentCreatorService.generateText();
        };
        
        $scope.updateContentOfProperty = (event) =>  {
            event.stopPropagation();
            event.preventDefault();
            
            umContentCreatorService.updateContentOfProperty(editorState);
            
            $scope.closeModal();
            $scope.configurationObject = umContentCreatorService.getInitialValues();
        }
        
        $scope.resetSettings = (event) => {
            event.stopPropagation();
            event.preventDefault();
            $scope.configurationObject = umContentCreatorService.getInitialValues();
        }
    });