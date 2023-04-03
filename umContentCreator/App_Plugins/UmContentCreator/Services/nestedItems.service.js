angular.module('umbraco').factory('nestedItemsService', function () {
    const nestedContentAlias = 'Umbraco.NestedContent';
    const configuration = {
        selectedPropertyKey: '',
        selectedPropertyAlias: '',
        nestedItemDetails: ''
    }
    
    return {
        getActiveProperty: function (property) {
            const nestedPropertyPath = configuration.nestedItemDetails
                .replace(`___${configuration.selectedPropertyAlias}`, '')
                .split("___");

            if (property.alias !== nestedPropertyPath[0]) {
                return null;
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
                foundProperty.editor = nestedContentAlias;
                return foundProperty;
            }
        },
        setConfiguration: function (selectedPropertyKey, selectedPropertyAlias, nestedItemDetails) {
            configuration.selectedPropertyKey = selectedPropertyKey;
            configuration.nestedItemDetails = nestedItemDetails;
            configuration.selectedPropertyAlias = selectedPropertyAlias;
        }
    };
});