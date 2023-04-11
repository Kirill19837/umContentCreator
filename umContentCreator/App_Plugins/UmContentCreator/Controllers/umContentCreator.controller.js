﻿angular.module('umbraco').controller('UmContentCreatorController',
    function ($scope, $http, $routeParams, $timeout, editorState, umContentCreatorService, notificationsService) {
        const navigation = document.getElementById("navigation");
        $scope.configurationObject = null;

        let modal;
        let modalContent;

        $scope.openModal = (event) => {
            event.stopPropagation();
            event.preventDefault();

            $scope.configurationObject = umContentCreatorService.getInitialValues();
            $scope.configurationObject.modalCaptionText = umContentCreatorService.setSelectedProperty(event, editorState);
            $scope.configurationObject.propertyHasValue = umContentCreatorService.checkIfPropertyHasValue();

            if (typeof event.target === 'undefined' || event.target === null) {
                return;
            }

            const button = event.target.closest("button");
            const uniqueId = button.getAttribute('unique-id');
            modal = document.getElementById('myModal' + uniqueId);
            modalContent = document.getElementById('myModalContent' + uniqueId);

            if (modal && modalContent) {
                navigation.classList.add("ng-hide");
                modal.style.display = "block";
                modalContent.style.display = "block";
            }

            window.addEventListener('mousedown', closeOnOutsideClick);
        };


        const closeOnOutsideClick = (event) => {
            if (modalContent && !isDescendant(modalContent, event.target) && event.target !== modalContent && event.target.id !== "openModalButton") {
                modal.style.display = "none";
                modalContent.style.display = "none";
                navigation.classList.remove("ng-hide");
                window.removeEventListener('mousedown', closeOnOutsideClick);
            }
        };

        const isDescendant = (parent, child) => {
            let node = child.parentNode;

            if (node === null) {
                return false;
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

        $scope.updateContentOfProperty = (event, replace) => {
            event.stopPropagation();
            event.preventDefault();

            umContentCreatorService.updateContentOfProperty(replace)
                .then(function (propertyEditor) {
                    umContentCreatorService.updateContentInDOM(replace, propertyEditor);
                    $scope.closeModal();
                    $scope.configurationObject = umContentCreatorService.getInitialValues();
                })
                .catch(function (error) {
                    notificationsService.error(error);
                });
        }
    });
