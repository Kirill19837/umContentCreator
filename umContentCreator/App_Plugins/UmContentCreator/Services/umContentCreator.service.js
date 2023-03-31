angular.module('umbraco').factory('umContentCreatorService', function ($http, contentResource, notificationsService) {
    const blockListAlias = 'Umbraco.BlockList';
    const blockGridAlias = 'Umbraco.BlockGrid';
    const defaultConfiguration = {
        generationModel: {
            prompt: '',
            maxTokens: 50,
            temperature: 0.6
        },
        selectedTokens: 50,
        selectedTemperature: 0.6,
        temperatureLabels: {
            0.2: 'Conservative',
            0.4: 'Cautious',
            0.6: 'Balanced',
            0.8: 'Creative',
            1.0: 'Adventurous'
        },
        isGenerating: false,
        generatedText: null
    };
    
    let configuration;
    
    return {
        getInitialValues: function () {
            configuration = JSON.parse(JSON.stringify(defaultConfiguration));
            return configuration;
        },
        generateText: function () {
            configuration.isGenerating = true;
            
            $http.post("/umbraco/api/UmContentCreator/GetGeneratedText", configuration.generationModel)
                .then(function (response) {
                    configuration.generatedText = response.data;
                    configuration.isGenerating = false;
                })
                .catch(function () {
                    notificationsService.error('Error', 'Failed to update property value.');
                    configuration.isGenerating = false;
                });
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
            const {content, properties} = this.getPropertiesAndContent(editorState);
            const propertyToUpdate = this.findProperty(properties);

            if (!propertyToUpdate) {
                notificationsService.error('Error', 'Failed to find the property to update.');
                return;
            }

            switch (propertyToUpdate.editor) {
                case "Umbraco.NestedContent": {
                    this.updatePropertyInNestedContent(content);
                    break;
                }
                case "Umbraco.BlockList": {
                    this.updatePropertyInBlockListItem(content, propertyToUpdate);
                    location.reload();
                    break;
                }
                case "Umbraco.BlockGrid": {
                    this.updatePropertyInBlockListItem(content, propertyToUpdate);
                    break;
                }
                default: {
                    this.updatePropertyInContent(content, propertyToUpdate);
                    break;
                }
            }
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
                    const nested = property.value.find(p => p.hasOwnProperty(configuration.selectedPropertyAlias.toString()));
                    
                    debugger
                    if (!nested) {
                        continue;
                    }
                    
                    return property;
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
        },
        updateNestedContentProperty: function (payload) {
            return $http.post("/umbraco/api/UmContentCreator/UpdateNestedContentProperty", payload);
        },
        updatePropertyInContent: function (content, propertyToUpdate)  {
            propertyToUpdate.value = configuration.generatedText;
            contentResource.save(content, false, [])
                .then(function () {})
                .catch(function () {
                    notificationsService.error('Error', 'Failed to update property value.');
                });
        },
        updatePropertyInBlockListItem: function (content, propertyToUpdate) {
            propertyToUpdate[configuration.selectedPropertyAlias] = configuration.generatedText;

            contentResource.save(content, false, [])
                .then(function () {})
                .catch(function () {
                    notificationsService.error('Error', 'Failed to update property value.');
                });
        },
        updatePropertyInNestedContent: function (content) {
            this.updateNestedContentProperty({
                contentId: content.id,
                propertyAlias: configuration.selectedPropertyAlias,
                value: configuration.generatedText
            }).then(function () {
                location.reload();
            }).catch(function () {
                notificationsService.error('Error', 'Failed to update nested property value.');
            });
        }
    };
});
