angular.module('umbraco').factory('umContentCreatorService', function ($http, contentResource, notificationsService) {
    const blockListAlias = 'Umbraco.BlockList';
    const blockGridAlias = 'Umbraco.BlockGrid';
    
    return {
        getInitialValues: function () {
            return {
                selectedProperty: null,
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
                prompt: ''
            };
        },
        getProperties: function (contentTypeKey, contentId) {
            return $http.get("/umbraco/api/UmContentCreator/GetProperties", {
                params: 
                    {
                        contentTypeKey: contentTypeKey,
                        contentId: contentId
                    }
            });
        },
        getGeneratedText: function (payload) {
            return $http.post("/umbraco/api/UmContentCreator/GetGeneratedText", payload);
        },
        getPropertiesAndContent: function (editorState) {
            const content = editorState.current;
            const variant = content.variants[0];
            const properties = variant.tabs.flatMap(t => t.properties);
            return {content, properties};
        },
        getActiveBlockListItem: function (properties) {
            const blockListProperties = properties.filter(p => p.editor === blockListAlias || p.editor === blockGridAlias);
            let result = null;
            for (const blockListProperty of blockListProperties) {
                const { activeContent } = this.getActiveContent(blockListProperty);
                
                result = activeContent;
            }
            return result;
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
        }, findProperty: function (properties, propertyAlias) {
            for (const property of properties) {
                if (property?.alias === propertyAlias) {
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
                    }
                    
                    contentData.editor = blockListAlias;
                    return contentData;
                }
                if (property.editor === "Umbraco.NestedContent") {
                    const nested = property.value.find(p => p.hasOwnProperty(propertyAlias));
                    
                    if (!nested) {
                        continue;
                    }
                    
                    return property;
                }
            }
            return null;
        },
        updateNestedContentProperty: function (payload) {
            return $http.post("/umbraco/api/UmContentCreator/UpdateNestedContentProperty", payload);
        },
        updatePropertyInContent: function (propertyToUpdate, generatedText, content) {
            propertyToUpdate.value = generatedText;
            contentResource.save(content, false, [])
                .then(function () {})
                .catch(function () {
                    notificationsService.error('Error', 'Failed to update property value.');
                });

            return false;
        },
        updatePropertyInBlockListItem: function (content, propertyAlias, propertyToUpdate, generatedText) {
            propertyToUpdate[propertyAlias] = generatedText;

            contentResource.save(content, false, [])
                .then(function () {
                    if (propertyToUpdate.editor === blockListAlias) {
                        location.reload();
                    }
                })
                .catch(function () {
                    notificationsService.error('Error', 'Failed to update property value.');
                });

            return false;
        },
        updatePropertyInNestedContent: function (content, propertyAlias, generatedText) {
            this.updateNestedContentProperty({
                contentId: content.id,
                propertyAlias: propertyAlias,
                value: generatedText
            }).then(function () {
                location.reload();
            }).catch(function () {
                notificationsService.error('Error', 'Failed to update nested property value.');
            });

            return false;
        }
    };
});
