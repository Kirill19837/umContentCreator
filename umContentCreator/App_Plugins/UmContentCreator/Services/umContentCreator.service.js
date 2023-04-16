angular.module('umbraco').factory('umContentCreatorService',
    function ($http, contentResource, notificationsService, $document, blockItemsService, nestedItemsService) {
        const blockListAlias = 'Umbraco.BlockList';
        const blockGridAlias = 'Umbraco.BlockGrid';

        const defaultConfiguration = {
            generationModel: {
                prompt: '',
                maxTokens: 50,
                temperature: 0.6
            },
            temperatureLabels: {
                0.2: 'Conservative',
                0.4: 'Cautious',
                0.6: 'Balanced',
                0.8: 'Creative',
                1.0: 'Adventurous'
            },
            selectedPropertyAlias: null,
            isGenerating: false,
            generatedText: '',
            content: null,
            propertyToUpdate: null,
            generateButtonText: 'Generate'
        };

        function isValidData(data) {
            return data && typeof data === 'object' && !Array.isArray(data);
        }

        function isValidArray(arr) {
            return arr && Array.isArray(arr);
        }

        let configuration;

        return {
            getInitialValues: function () {
                configuration = JSON.parse(JSON.stringify(defaultConfiguration));
                return configuration;
            },
            checkIfPropertyHasValue: function () {
                const propertyToUpdate = configuration.propertyToUpdate;

                if (!isValidData(propertyToUpdate)) {
                    return;
                }

                const value = propertyToUpdate.value ?? propertyToUpdate[configuration.selectedPropertyAlias];

                if (!value) {
                    return false;
                }

                return value.length !== 0;
            },
            getGeneratedText: function (generationModel) {
                if (!isValidData(generationModel)) {
                    return;
                }

                configuration.isGenerating = true;
                generationModel.propertyEditorAlias = configuration.generationModel.propertyEditorAlias;
                configuration.generationModel = generationModel;

                $http.post("/umbraco/api/UmContentCreator/GetGeneratedText", generationModel)
                    .then(function (response) {
                        configuration.generatedText = response.data;
                        configuration.isGenerating = false;
                        configuration.generateButtonText = 'Regenerate';
                    })
                    .catch(function () {
                        notificationsService.error('Error', 'Failed to generate text.');
                        configuration.isGenerating = false;
                    });

                return configuration;
            },
            getPropertiesAndContent: function (editorState) {
                if (!isValidData(editorState) || !isValidData(editorState.current)) {
                    return {content: null, properties: []};
                }

                const content = editorState.current;
                const variant = content.variants[0];

                if (!isValidData(variant) || !isValidArray(variant.tabs)) {
                    return {content, properties: []};
                }

                const properties = variant.tabs.flatMap(t => t.properties);

                return {content, properties};
            },
            updateContentOfProperty: function (replace) {
                return new Promise((resolve, reject) => {
                    const propertyToUpdate = configuration.propertyToUpdate;
                    const content = configuration.content;
                    const generatedText = configuration.generatedText;

                    if (!isValidData(propertyToUpdate) || !content || !generatedText) {
                        reject('Failed to find the property to update.');
                        return;
                    }

                    switch (propertyToUpdate.editor) {
                        case "Umbraco.NestedContent": {
                            if (!replace) {
                                propertyToUpdate[configuration.selectedPropertyAlias] = propertyToUpdate[configuration.selectedPropertyAlias] + generatedText;
                                break;
                            }

                            propertyToUpdate[configuration.selectedPropertyAlias] = generatedText;
                            break;
                        }
                        case "Umbraco.BlockList": {
                            propertyToUpdate[configuration.selectedPropertyAlias] = generatedText;
                            break;
                        }
                        case "Umbraco.BlockGrid": {
                            if (!replace) {
                                propertyToUpdate[configuration.selectedPropertyAlias] = propertyToUpdate[configuration.selectedPropertyAlias] + generatedText;
                                break;
                            }
                            propertyToUpdate[configuration.selectedPropertyAlias] = generatedText;
                            break;
                        }
                        default: {
                            if (!replace) {
                                propertyToUpdate.value = propertyToUpdate.value + generatedText;
                                break;
                            }
                            propertyToUpdate.value = generatedText;
                            break;
                        }
                    }

                    contentResource.save(content, false, [])
                        .then(function () {
                            notificationsService.success('Content created successfully.');
                            resolve(propertyToUpdate.editor);
                        })
                        .catch(function () {
                            reject('Failed to update property value.');
                        });
                });
            },
            getTargetElement: function () {
                const propertyAlias = configuration.selectedPropertyAlias;
                const targetElementFromNestedContent = angular.element($document[0].querySelector(`input[id$="${configuration.nestedItemDetails}"], textarea[id$="${configuration.nestedItemDetails}"]`));
                const targetElementFromBlockListContent = angular.element($document[0].querySelector(`input[id$="${propertyAlias}"], textarea[id$="${propertyAlias}"]`));
                return targetElementFromNestedContent.length ? targetElementFromNestedContent : targetElementFromBlockListContent;
            },
            updateContentInDOM: function (replace, propertyEditor) {
                if (propertyEditor === blockGridAlias) {
                    return;
                }
                
                const targetElement = this.getTargetElement();
                if (targetElement.length) {
                    const currentText = targetElement.val();

                    if (replace) {
                        targetElement.val(configuration.generatedText);
                    } else {
                        targetElement.val(currentText + '\n' + configuration.generatedText);
                    }

                    targetElement.triggerHandler('input');
                }
            },
            findProperty: function (properties) {
                if (!isValidArray(properties)) {
                    return null;
                }

                for (const property of properties) {
                    if (property?.alias === configuration.selectedPropertyAlias) {
                        return property;
                    }

                    if (property.editor === blockListAlias || property.editor === blockGridAlias) {
                        const activeProperty = blockItemsService.getActiveProperty(property);

                        if (!activeProperty) {
                            continue;
                        }

                        return activeProperty;
                    }
                    if (property.editor === "Umbraco.NestedContent") {
                        const activeProperty = nestedItemsService.getActiveProperty(property);

                        if (!activeProperty) {
                            continue;
                        }

                        return activeProperty;
                    }
                }
                return null;
            },
            getPropertyElementDetails: function (event) {
                const targetElement = angular.element(event.target);
                const propertyElement = targetElement.closest('umb-property');
                const controllerElement = propertyElement.find('[ng-controller]').first();
                const controllerName = controllerElement.attr('ng-controller').split(' ').pop();

                return {propertyElement, controllerName};
            },
            getPropertyDetails: function (propertyElement) {
                const selectedPropertyKey = propertyElement.attr('element-key');
                const labelKey = propertyElement.attr('data-element').replace('property-', 'property-label-');
                const label = propertyElement.find(`label[data-element=${labelKey}]`)[0];
                const modalCaptionText = 'Create content for ' + `<span>${label?.innerText?.replace('*', '')}</span>`;
                const dataElementValue = propertyElement.attr('data-element').split('-').pop();
                const nestedItemDetails = dataElementValue.split('___');
                const selectedPropertyAlias = nestedItemDetails.length === 1 ? dataElementValue : nestedItemDetails[nestedItemDetails.length - 1];
                return {selectedPropertyKey, dataElementValue, selectedPropertyAlias, modalCaptionText};
            },
            setSelectedProperty: function (event, editorState) {
                const {propertyElement, controllerName} = this.getPropertyElementDetails(event);
                const {selectedPropertyKey, dataElementValue, selectedPropertyAlias, modalCaptionText} = this.getPropertyDetails(propertyElement);
                let selectedPropertyEditorAlias = '';

                switch (controllerName) {
                    case "Umbraco.PropertyEditors.textAreaController": {
                        selectedPropertyEditorAlias = "Umbraco.TextArea";
                        break;
                    }
                    case "Umbraco.PropertyEditors.textboxController": {
                        selectedPropertyEditorAlias = "Umbraco.TextBox";
                        break;
                    }
                    case "Umbraco.PropertyEditors.RTEController": {
                        selectedPropertyEditorAlias = "Umbraco.TinyMCE";
                        break;
                    }
                }

                configuration.generationModel.propertyEditorAlias = selectedPropertyEditorAlias;
                configuration.selectedPropertyAlias = selectedPropertyAlias;

                blockItemsService.setPropertyKey(selectedPropertyKey);
                nestedItemsService.setConfiguration(selectedPropertyKey, selectedPropertyAlias, dataElementValue);
                configuration.nestedItemDetails = dataElementValue;

                const {content, properties} = this.getPropertiesAndContent(editorState);
                const propertyToUpdate = this.findProperty(properties);

                configuration.content = content;
                configuration.propertyToUpdate = propertyToUpdate;

                return modalCaptionText;
            }
        };
    });
