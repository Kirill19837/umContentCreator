angular.module('umbraco').factory('blockItemsService', function () {
    const blockListAlias = 'Umbraco.BlockList';
    const blockGridAlias = 'Umbraco.BlockGrid';
    
    const configuration = {
        selectedPropertyKey: ''
    }
    return {
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
            const udi = `umb://element/${configuration.selectedPropertyKey?.replace(/-/g, "")}`;
            return this.findNestedContentDataInArray(contentData, udi);
        },
        getActiveProperty: function (property) {
            const activeItem = this.getActiveBlockItem(property);

            if (!activeItem) {
                return null;
            }

            if (property.editor === blockGridAlias) {
                activeItem.editor = blockGridAlias;
                return activeItem;
            }

            activeItem.editor = blockListAlias;
            return activeItem;
        },
        setPropertyKey: function (selectedPropertyKey) {
            configuration.selectedPropertyKey = selectedPropertyKey;
        }
    };
});
