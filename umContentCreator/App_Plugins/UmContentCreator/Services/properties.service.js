angular.module('umbraco').factory('propertiesService', function ($http) {
    return {
        getProperties: function (contentTypeKey) {
            return $http.get("/umbraco/api/UmContentCreator/GetProperties", {params: {contentTypeKey: contentTypeKey}});
        },
        getGeneratedText: function (payload) {
            return $http.post("/umbraco/api/UmContentCreator/GetGeneratedText", payload);
        },
        updateNestedProperty: function (payload) {
            return $http.post("/umbraco/api/UmContentCreator/UpdateNestedProperty", payload);
        },
        getPropertiesAndContent: function (editorState) {
            const content = editorState.current;
            const variant = content.variants[0];
            const properties = variant.tabs.flatMap(t => t.properties);
            return {content, properties};
        },
        findProperty: function (properties, propertyAlias) {
            for (const property of properties) {
                if (property?.alias === propertyAlias) {
                    return property;
                }

                if (property.editor === "Umbraco.BlockList") {
                    const value = property.value;
                    const blockListItems = value.layout["Umbraco.BlockList"]
                        .map(p => p.$block);
                    const activeBlockListItem = blockListItems?.find(i => i?.active === true);
                    const activeContentUdi = activeBlockListItem?.data?.udi;
                    const contentData = value?.contentData?.find(cd => cd?.udi === activeContentUdi);

                    if (!contentData) {
                        continue;
                    }
                    contentData.editor = "Umbraco.BlockList";
                    return contentData;
                }
                if (property.editor === "Umbraco.NestedContent") {
                    return property;
                }
            }
            return null;
        },
        getActiveBlockListItem: function (properties) {
            const blockListProperties = properties.filter(p => p.editor === "Umbraco.BlockList");
            let activeBlockListItem = null;
            for (const blockListProperty of blockListProperties) {
                const blockListItems = blockListProperty.value.layout["Umbraco.BlockList"]
                    .map(p => p.$block);
                activeBlockListItem = blockListItems.find(i => i?.active === true);
            }
            return activeBlockListItem;
        }
    };
});
