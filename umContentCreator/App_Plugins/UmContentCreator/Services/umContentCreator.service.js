angular.module('umbraco').factory('umContentCreatorService',
    function ($http, contentResource, notificationsService, $timeout) {
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
            generatedText: ''
        };
        
        let configuration;
        
        return {
            getInitialValues: function () {
                configuration = JSON.parse(JSON.stringify(defaultConfiguration));
                return configuration;
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
            getActiveContent: function (property) {
                const value = property.value;
                const blockListItems = value.layout[blockListAlias];
                const blockGridItems = value.layout[blockGridAlias];
                const items = (blockListItems ?? blockGridItems);
                const activeBlockListItem = items?.map(p => p.$block)?.find(i => i?.active === true);
                const activeBlockListItemFromArea = items?.flatMap(p => p?.areas)
                    ?.flatMap(i => i?.items)
                    ?.map(p => p?.$block)
                    ?.find(i => i?.active === true);
                const activeContent = (activeBlockListItem ?? activeBlockListItemFromArea);
                return {value, activeContent};
            },
            getPropertiesAndContent: function (editorState) {
                const content = editorState.current;
                const variant = content.variants[0];
                const properties = variant.tabs.flatMap(t => t.properties);
                
                return {content, properties};
            }, 
            updateContentOfProperty: function (editorState) {
                return new Promise((resolve, reject) => {
                    const {content, properties} = this.getPropertiesAndContent(editorState);
                    const propertyToUpdate = this.findProperty(properties);

                    if (!propertyToUpdate) {
                        reject('Failed to find the property to update.');
                        return;
                    }

                    debugger
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
                        const {value, activeContent} = this.getActiveContent(property);
    
                        const activeContentUdi = activeContent?.data?.udi;
                        const contentData = value?.contentData?.find(data => data?.udi === activeContentUdi);
                        
                        if (!contentData) {
                            continue;
                        }
                        
                        if (property.editor === blockGridAlias) {
                            contentData.editor = blockGridAlias;
                            return contentData;
                        }
                        
                        contentData.editor = blockListAlias;
                        return contentData;
                    }
                    if (property.editor === "Umbraco.NestedContent") {
                        const nestedItems = property.value;

                        for (const nestedItem of nestedItems) {
                            
                        }
                        
                        const nested = property.value.find(p => p.hasOwnProperty(configuration.selectedPropertyAlias.toString()));
                        
                        if (!nested) {
                            continue;
                        }
                        
                        nested.editor = "Umbraco.NestedContent";
                        return nested;
                    }
                }
                return null;
            },
            setSelectedProperty: function (event) {
                const targetElement = angular.element(event.target);
                const propertyElement = targetElement.closest('umb-property');
                const dataElementValue = propertyElement.attr('data-element');
                const splitValues = dataElementValue.split('__');
                const selectedPropertyEditorAlias = splitValues.pop();
                const selectedPropertyAlias = splitValues.pop();
                
                configuration.generationModel.propertyEditorAlias = selectedPropertyEditorAlias;
                configuration.selectedPropertyAlias = selectedPropertyAlias;
            }
        };
});
