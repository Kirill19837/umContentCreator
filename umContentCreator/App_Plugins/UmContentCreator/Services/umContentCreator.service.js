angular.module('umbraco').factory('umContentCreatorService',
    function ($http, contentResource, notificationsService, $document) {
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
            nestedPropertyPath: [],
            isGenerating: false,
            generatedText: '',
            content: null,
            propertyToUpdate: null
        };
        
        let configuration;
        
        return {
            getInitialValues: function () {
                configuration = JSON.parse(JSON.stringify(defaultConfiguration));
                return configuration;
            },
            checkIfPropertyHasValue: function () {
                const value = configuration.propertyToUpdate?.value ?? configuration.propertyToUpdate[configuration.selectedPropertyAlias];
                return value !== null && value.length !== 0;
            },
            getGeneratedText: function (generationModel) {
                configuration.isGenerating = true;
                generationModel.propertyEditorAlias = configuration.generationModel.propertyEditorAlias;
                configuration.generationModel = generationModel;
                
                $http.post("/umbraco/api/UmContentCreator/GetGeneratedText", generationModel)
                    .then(function (response) {
                        configuration.generatedText = response.data;
                        configuration.isGenerating = false;
                    })
                    .catch(function () {
                        notificationsService.error('Error', 'Failed to update property value.');
                        configuration.isGenerating = false;
                    });
                
                return configuration;
            },
            findNestedContentData: function (data, udi) {
                if (data.udi === udi) {
                    return data;
                }

                for (const key of Object.keys(data)) {
                    if (data[key].hasOwnProperty('contentData')) {
                        const result = this.findNestedContentDataInArray(data[key].contentData, udi);
                        if (result) {
                            return result;
                        }
                    }
                }

                return null;
            },
            findNestedContentDataInArray: function (contentDataArray, udi) {
                for (const data of contentDataArray) {
                    const result = this.findNestedContentData(data, udi);
                    if (result) {
                        return result;
                    }
                }
                return null;
            },
            getActiveBlockItem: function (property) {
                const contentData = property.value.contentData;
                const udi = `umb://element/${configuration.selectedPropertyKey.replace(/-/g, "")}`;
                const blockItem = this.findNestedContentDataInArray(contentData, udi);
                return blockItem;
            },
            getPropertiesAndContent: function (editorState) {
                const content = editorState.current;
                const variant = content.variants[0];
                const properties = variant.tabs.flatMap(t => t.properties);
                
                return {content, properties};
            }, 
            updateContentOfProperty: function () {
                return new Promise((resolve, reject) => {
                    const propertyToUpdate = configuration.propertyToUpdate;
                    const content = configuration.content;
                    
                    if (!propertyToUpdate) {
                        reject('Failed to find the property to update.');
                        return;
                    }
                    switch (propertyToUpdate.editor) {
                        case "Umbraco.NestedContent": {
                            propertyToUpdate[configuration.selectedPropertyAlias] = configuration.generatedText;
                            break;
                        }
                        case "Umbraco.BlockList": {
                            propertyToUpdate[configuration.selectedPropertyAlias] = configuration.generatedText;
                            break;
                        }
                        case "Umbraco.BlockGrid": {
                            propertyToUpdate[configuration.selectedPropertyAlias] = configuration.generatedText;
                            break;
                        }
                        default: {
                            propertyToUpdate.value = configuration.generatedText;
                            break;
                        }
                    }

                    contentResource.save(content, false, [])
                        .then(function () {
                            const propertyAlias = configuration.selectedPropertyAlias;
                            const targetElementFromNestedContent = angular.element($document[0].querySelector(`input[id$="${configuration.nestedItemDetails}"], textarea[id$="${configuration.nestedItemDetails}"]`));
                            const targetElementFromBlockListContent = angular.element($document[0].querySelector(`input[id$="${propertyAlias}"], textarea[id$="${propertyAlias}"]`));
                            const targetElement = targetElementFromNestedContent.length ? targetElementFromNestedContent : targetElementFromBlockListContent;
                            if (targetElement.length) {
                                targetElement.val(configuration.generatedText);
                                targetElement.triggerHandler('input');
                            }
                            resolve();
                        })
                        .catch(function () {
                            reject('Failed to update property value.');
                        });
                });
            },
            findProperty: function (properties) {
                for (const property of properties) {
                    if (property?.alias === configuration.selectedPropertyAlias) {
                        return property;
                    }
    
                    if (property.editor === blockListAlias || property.editor === blockGridAlias) {
                        const activeItem = this.getActiveBlockItem(property);
                        
                        if (!activeItem) {
                            continue;
                        }
                        
                        if (property.editor === blockGridAlias) {
                            activeItem.editor = blockGridAlias;
                            return activeItem;
                        }

                        activeItem.editor = blockListAlias;
                        return activeItem;
                    }
                    if (property.editor === "Umbraco.NestedContent") {
                        const nestedPropertyPath = configuration.nestedItemDetails
                            .replace(`___${configuration.selectedPropertyAlias}`, '')
                            .split("___");
                        
                        if (property.alias !== nestedPropertyPath[0]) {
                            continue;
                        }

                        const findNestedProperty = (items, nestedPropertyPath) => {
                            if (!items || !nestedPropertyPath) {
                                return null;
                            }

                            if (nestedPropertyPath.length === 0) {
                                for (const item of items) {
                                    if (item.key === configuration.selectedPropertyKey) {
                                        return item;
                                    }
                                }
                                return null;
                            }

                            const currentPath = nestedPropertyPath.shift();
                            for (const item of items) {
                                if (item[currentPath]) {
                                    if (nestedPropertyPath.length === 0) {
                                        if (item[currentPath].key === configuration.selectedPropertyKey) {
                                            return item[currentPath];
                                        } else if (Array.isArray(item[currentPath]) && item[currentPath].some(p => p.key === configuration.selectedPropertyKey)) {
                                            return item[currentPath].find(p => p.key === configuration.selectedPropertyKey);
                                        }
                                    } else {
                                        const result = findNestedProperty(item[currentPath], [...nestedPropertyPath]);
                                        if (result) {
                                            return result;
                                        }
                                    }
                                }
                            }

                            return null;
                        };

                        const foundProperty = findNestedProperty(property.value, nestedPropertyPath.length > 1 ? nestedPropertyPath.slice(1) : []);
                        if (foundProperty) {
                            foundProperty.editor = "Umbraco.NestedContent";
                            return foundProperty;
                        }
                    }

                }
                return null;
            },
            setSelectedProperty: function (event, editorState) {
                const targetElement = angular.element(event.target);
                const propertyElement = targetElement.closest('umb-property');
                const controllerElement = propertyElement.find('[ng-controller]').first();
                const controllerName = controllerElement.attr('ng-controller').split(' ').pop();
                
                const selectedPropertyKey = propertyElement.attr('element-key');
                const dataElementValue = propertyElement.attr('data-element').split('-').pop();
                const nestedItemDetails = dataElementValue.split('___');
                const selectedPropertyAlias = nestedItemDetails.length === 1 ? dataElementValue : nestedItemDetails[nestedItemDetails.length - 1];
                
                let selectedPropertyEditorAlias = '';
                
                switch (controllerName) {
                    case "Umbraco.PropertyEditors.textAreaController" : {
                        selectedPropertyEditorAlias = "Umbraco.TextArea";
                        break;
                    }
                    case "Umbraco.PropertyEditors.textboxController" : {
                        selectedPropertyEditorAlias = "Umbraco.TextBox";
                        break;
                    }
                    case "Umbraco.PropertyEditors.RTEController" : {
                        selectedPropertyEditorAlias = "Umbraco.TinyMCE";
                        break;
                    }
                }

                configuration.generationModel.propertyEditorAlias = selectedPropertyEditorAlias;
                configuration.selectedPropertyAlias = selectedPropertyAlias;
                configuration.nestedItemDetails = dataElementValue;
                configuration.selectedPropertyKey = selectedPropertyKey;

                const {content, properties} = this.getPropertiesAndContent(editorState);
                const propertyToUpdate = this.findProperty(properties);

                configuration.content = content;
                configuration.propertyToUpdate = propertyToUpdate;
            }
        };
});
