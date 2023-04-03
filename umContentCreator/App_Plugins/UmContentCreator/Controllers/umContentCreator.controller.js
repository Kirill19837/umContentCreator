angular.module('umbraco').controller('UmContentCreatorController',
    function ($scope, $http, $routeParams, $timeout, editorState, umContentCreatorService, notificationsService) {
        const navigation = document.getElementById("navigation");
        $scope.configurationObject = null;
        
        let modal;
        let modalContent;
        
        $scope.openModal = (event) => {
            event.stopPropagation();
            event.preventDefault();

            $scope.configurationObject = umContentCreatorService.getInitialValues();
            umContentCreatorService.setSelectedProperty(event, editorState);
            $scope.configurationObject.userAcceptedOverride = false;
            $scope.configurationObject.propertyHasValue = umContentCreatorService.checkIfPropertyHasValue();
            
            const button = event.target;
            const uniqueId = button.getAttribute('unique-id');
            modal = document.getElementById('myModal' + uniqueId);
            modalContent = document.getElementById('myModalContent' + uniqueId);

            navigation.classList.add("ng-hide");
            modal.style.display = "block";
            modalContent.style.display = "block";

            window.addEventListener('mousedown', closeOnOutsideClick);
        };

        const closeOnOutsideClick = (event) => {
            if (!isDescendant(modalContent, event.target) && event.target !== modalContent && event.target.id !== "openModalButton") {
                modal.style.display = "none";
                modalContent.style.display = "none";
                window.removeEventListener('mousedown', closeOnOutsideClick);
            }
        };

        const isDescendant = (parent, child) => {
            let node = child.parentNode;
            
            if (node === null) {
                return false
            }
            
            if (node === parent) {
                return true;
            }

            return isDescendant(parent, node);
        };
        
        $scope.closeModal = () => {
            navigation.classList.remove("ng-hide");
            modal.style.display = "none";
            modalContent.style.display = "none";
            $scope.configurationObject = umContentCreatorService.getInitialValues();
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

            $scope.configurationObject = umContentCreatorService.getGeneratedText($scope.configurationObject.generationModel);
        };
        
        $scope.updateContentOfProperty = (event, replace) =>  {
            event.stopPropagation();
            event.preventDefault();

            umContentCreatorService.updateContentOfProperty(editorState)
                .then(function () {
                    umContentCreatorService.updateContentInDOM(replace);
                    $scope.closeModal();
                    $scope.configurationObject = umContentCreatorService.getInitialValues();
                })
                .catch(function (error) {
                    notificationsService.error(error);
                });
        }

        $scope.resetSettings = (event) => {
            event.stopPropagation();
            event.preventDefault();
            $scope.configurationObject = umContentCreatorService.getInitialValues();
        }
    });