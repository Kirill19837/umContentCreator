angular.module("umbraco").component("umContentCreator", {
    templateUrl: '/App_Plugins/UmContentCreator/Views/umContentCreator.html',
    require: {
        umbProperty: "^^umbProperty"
    },
    controller: [
        "$element",
        'umPropertyContentCreatorService',
        'modalService',
        'umImageContentCreatorService',
        'contentResource',
        'editorState',
        'notificationsService',
        '$timeout',
        function umContentCreatorController(
            $element,
            umPropertyContentCreatorService,
            modalService,
            umImageContentCreatorService,
            contentResource,
            editorState,
            notificationsService,
            $timeout
        ) {

            const allowedEditors = [
                'Umbraco.MediaPicker',
                'Umbraco.TextBox',
                'Umbraco.TinyMCE',
                'Umbraco.TextArea'
            ];
            this.mode = null;
            this.configurationObject = null;

            this.$onInit = () => {
                if (this.umbProperty == null || this.umbProperty.property == null || !allowedEditors.includes(this.umbProperty.property.editor)) {
                    this.remove();
                    return;
                }

                this.setMode();
                this.updatePositionInDom();
                this.setFormPrestine();
            }

            this.updatePositionInDom = () => {
                $timeout(() => {
                    const $controls = $element.prev(".controls");
                    const $propertyEditor = $controls.find("ng-form");
                    const imagePreview = $controls.find('[ng-controller="Umbraco.PropertyEditors.MediaPickerController as vm"]');

                    if (imagePreview.length > 0) {
                        imagePreview.append($element);
                        imagePreview.css('display', 'flex');
                        imagePreview.css('gap', '5px');
                    } else if ($propertyEditor.length > 0) {
                        $propertyEditor.append($element);
                        $propertyEditor.css('display', 'flex');
                        $propertyEditor.css('gap', '10px');
                    }
                }, 200);
            }

            this.remove = () => {
                $element.remove();
            }

            this.setMode = () => {
                if (this.umbProperty.property.editor === 'Umbraco.MediaPicker') {
                    this.mode = 'image';
                } else {
                    this.mode = 'text';
                }
            }

            this.openModal = (event) => {
                event.stopPropagation();
                event.preventDefault();

                if (this.mode === 'image') {
                    this.configurationObject = umImageContentCreatorService.getInitialValues();
                } else {
                    this.configurationObject = umPropertyContentCreatorService.getInitialValues();
                }
                
                this.configurationObject.modalCaptionText = 'Create content for ' + `<span>${this.umbProperty.property.label}</span>`;
                this.configurationObject.propertyHasValue = this.umbProperty.property.value != undefined;

                if (typeof event.target === 'undefined' || event.target === null) {
                    return;
                }

                modalService.openModal(event);
            };

            this.closeModal = () => {
                modalService.closeModal();
                this.configurationObject = umPropertyContentCreatorService.getInitialValues();
            }

            this.getTemperatureLabel = function (temperatureValue) {
                if (!this.configurationObject?.temperatureLabels) {
                    return;
                }
                return this.configurationObject?.temperatureLabels[temperatureValue];
            };

            this.generateText = (event) => {
                event.stopPropagation();
                event.preventDefault();
                this.configurationObject.generatedText = null;

                if (!this.configurationObject.generationModel.prompt) {
                    return;
                }

                const propertyEditorAlias = this.umbProperty.property.editor;
                this.configurationObject = umPropertyContentCreatorService.getGeneratedText(this.configurationObject.generationModel, propertyEditorAlias);
            };

            this.updateContentOfTextProperty = async (event, replace) => {
                event.stopPropagation();
                event.preventDefault();

                this.umbProperty.property.value = replace ? this.configurationObject.generatedText : `${this.umbProperty.property.value}\n${this.configurationObject.generatedText}`;

                try {
                    await contentResource.save(editorState.current, false, []);
                    notificationsService.success('Content created successfully.');
                    this.closeModal();
                    this.configurationObject = umPropertyContentCreatorService.getInitialValues();
                    this.setFormPrestine();
                } catch (e) {
                    notificationsService.error('Failed to update content of property.');
                }
            }

            this.generateImages = async (event) => {
                event.stopPropagation();
                event.preventDefault();
                this.configurationObject.generatedImages = [];

                if (!this.configurationObject.generationModel.prompt) {
                    return;
                }

                try {
                    await umImageContentCreatorService.getGeneratedImages(this.configurationObject.generationModel);
                    if (this.configurationObject.generatedImages.length === 1) {
                        const generatedImage = this.configurationObject.generatedImages[0];
                        generatedImage.selected = true;
                        this.configurationObject.selectedImage = generatedImage;
                    }
                } catch (e) {
                    notificationsService.error('Error', e);
                }
            };

            this.selectImage = function (image) {
                if (this.configurationObject.selectedImage) {
                    this.configurationObject.selectedImage.selected = false;
                }

                image.selected = true;
                this.configurationObject.selectedImage = image;

            };

            this.updateContentOfImageProperty = async (event) => {
                event.stopPropagation();
                event.preventDefault();

                if (!this.configurationObject.selectedImage) {
                    notificationsService.error('Error', 'No image selected');
                    return;
                }

                const selectedImageUrl = this.configurationObject.selectedImage.url;
                this.configurationObject.isAddingMedia = true;

                try {
                    const udi = await umImageContentCreatorService.uploadImageFromUrl(selectedImageUrl, this.configurationObject.generationModel.prompt);
                    this.configurationObject.isAddingMedia = false;
                    this.umbProperty.property.value = udi;
                    const $controls = $element.closest(".umb-property-editor");
                    const image = $controls.find('img').first();
                    image.attr('src', selectedImageUrl);
                    await contentResource.save(editorState.current, false, []);
                    notificationsService.success('Content created successfully.');
                    this.configurationObject = umImageContentCreatorService.getInitialValues();
                    this.closeModal();
                    this.setFormPrestine();
                } catch (e) {
                    notificationsService.error('Error', e);
                }
            }

            this.setFormPrestine = () => {
                const mainFormController = angular.element('form[name=contentForm]').controller('form');

                $timeout(() => {
                    mainFormController.$setPristine();
                });
            }
        }
    ]
});
