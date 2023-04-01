angular.module('umbraco').controller('UmContentCreatorController',
    function ($scope, $http, $routeParams, $timeout, editorState, umContentCreatorService) {
        const modal = document.getElementById("um-content-creator-modal");
        const modalContent = document.getElementById("um-content-creator-modal-content");
        const navigation = document.getElementById("navigation");
        $scope.configurationObject = umContentCreatorService.getInitialValues();

        $scope.openModal = (event) => {
            event.stopPropagation();
            event.preventDefault();

            umContentCreatorService.setSelectedProperty(event);

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
            
            if (!$scope.configurationObject.generationModel.prompt) {
                return;
            }

            console.log($scope.configurationObject);
            $scope.configurationObject = umContentCreatorService.getGeneratedText($scope.configurationObject.generationModel);
            console.log($scope.configurationObject);
        };
        
        $scope.updateContentOfProperty = (event) =>  {
            event.stopPropagation();
            event.preventDefault();

            umContentCreatorService.updateContentOfProperty(editorState)
                .then(function () {
                    $scope.closeModal();
                    $scope.configurationObject = umContentCreatorService.getInitialValues();
                    // Trigger a digest cycle to update the view
                    $timeout(angular.noop);
                })
                .catch(function (error) {
                });
        }
        
        $scope.resetSettings = (event) => {
            event.stopPropagation();
            event.preventDefault();
            $scope.configurationObject = umContentCreatorService.getInitialValues();
        }
    });