angular.module('umbraco').controller('UmImageContentCreatorController',
    function ($scope, umImageContentCreatorService, notificationsService, modalService, propertyContentService, mediaResource) {
        $scope.configurationObject = null;

        $scope.openModal = (event) => {
            event.stopPropagation();
            event.preventDefault();

            $scope.configurationObject = umImageContentCreatorService.getInitialValues();
            $scope.configurationObject.modalCaptionText = propertyContentService.setSelectedProperty(event);
            $scope.configurationObject.propertyHasValue = propertyContentService.checkIfPropertyHasValue();

            if (typeof event.target === 'undefined' || event.target === null) {
                return;
            }

            modalService.openModal(event);
        };

        $scope.closeModal = () => {
            modalService.closeModal();
            $scope.configurationObject = umImageContentCreatorService.getInitialValues();
        }

        $scope.generateImages = (event) => {
            event.stopPropagation();
            event.preventDefault();
            $scope.configurationObject.generatedImages = [];

            if (!$scope.configurationObject.generationModel.prompt) {
                return;
            }

            umImageContentCreatorService.getGeneratedImages($scope.configurationObject.generationModel)
                .then(configuration => {
                    if (configuration.generatedImages.length === 1) {
                        const generatedImage = configuration.generatedImages[0];
                        generatedImage.selected = true;
                        $scope.configurationObject.selectedImage = generatedImage;
                    }
                    $scope.configurationObject = configuration;
                    
                })
                .catch(error => {
                    notificationsService.error('Error', error);
                });
        };

        $scope.selectImage = function(image) {
            if ($scope.configurationObject.selectedImage) {
                $scope.configurationObject.selectedImage.selected = false;
            }

            image.selected = true;
            $scope.configurationObject.selectedImage = image;
        };

        $scope.updateContentOfProperty = (event, replace) => {
            event.stopPropagation();
            event.preventDefault();

            if (!$scope.configurationObject.selectedImage) {
                notificationsService.error('Error', 'No image selected');
                return;
            }

            const selectedImageUrl = $scope.configurationObject.selectedImage.url;
            $scope.configurationObject.isAddingMedia = true;
            
            umImageContentCreatorService.uploadImageFromUrl(selectedImageUrl, $scope.configurationObject.generationModel.prompt)
                .then(udi => {
                    propertyContentService.updateContentOfProperty(replace, udi)
                        .then(function (propertyEditor) {
                            propertyContentService.updateContentInDOM(replace, propertyEditor, selectedImageUrl);
                            $scope.configurationObject.isAddingMedia = false;
                            $scope.closeModal();
                            $scope.configurationObject = umImageContentCreatorService.getInitialValues();
                        })
                        .catch(function (error) {
                            notificationsService.error(error);
                        });
                })
                .catch(error => {
                    notificationsService.error('Error', error);
                });
        }
    });
