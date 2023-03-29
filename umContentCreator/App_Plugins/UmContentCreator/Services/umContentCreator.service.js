angular.module('umbraco').factory('umContentCreatorService', function ($http, contentResource, notificationsService) {
    const blockListAlias = 'Umbraco.BlockList';
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
            const blockListProperties = properties.filter(p => p.editor === blockListAlias);
            let activeBlockListItem = null;
            for (const blockListProperty of blockListProperties) {
                const blockListItems = blockListProperty.value.layout[blockListAlias]
                    .map(p => p.$block);
                activeBlockListItem = blockListItems.find(i => i?.active === true);
            }
            return activeBlockListItem;
        },
        findProperty: function (properties, propertyAlias) {
            for (const property of properties) {
                if (property?.alias === propertyAlias) {
                    return property;
                }

                if (property.editor === blockListAlias) {
                    const value = property.value;
                    const blockListItems = value.layout[blockListAlias]
                        .map(p => p.$block);
                    const activeBlockListItem = blockListItems?.find(i => i?.active === true);
                    const activeContentUdi = activeBlockListItem?.data?.udi;
                    const contentData = value?.contentData?.find(cd => cd?.udi === activeContentUdi);

                    if (!contentData) {
                        continue;
                    }
                    contentData.editor = blockListAlias;
                    return contentData;
                }
                if (property.editor === "Umbraco.NestedContent") {
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
                    location.reload();
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
