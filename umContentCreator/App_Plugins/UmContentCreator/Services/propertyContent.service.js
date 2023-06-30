angular.module('umbraco').factory('propertyContentService', 
    function (contentResource, $document, blockItemsService, nestedItemsService, editorState, notificationsService) {
    let configuration = {
        content: null,
        propertyToUpdate: null,
        selectedPropertyAlias: null,
        selectedPropertyEditorAlias: null,
        propertyElement: null
    };
    
    const blockListAlias = 'Umbraco.BlockList';
    const blockGridAlias = 'Umbraco.BlockGrid';
    
    function isValidData(data) {
        return data && typeof data === 'object' && !Array.isArray(data);
    }

    function isValidArray(arr) {
        return arr && Array.isArray(arr);
    }
    
    return {
        getPropertyEditorAlias: () => {
            return configuration.selectedPropertyEditorAlias;
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
        getPropertiesAndContent: function () {
            if (!isValidData(editorState) || !isValidData(editorState.current)) {
                return {content: null, properties: []};
            }
            
            const content = editorState.current;
            const variant = content.variants?.find(v => v.active === true);

            if (!isValidData(variant) || !isValidArray(variant.tabs)) {
                return {content, properties: []};
            }

            variant.save = true;
            const properties = variant.tabs.flatMap(t => t.properties);

            return {content, properties};
        },
        updateContentOfProperty: function (replace, valueToSet) {
            return new Promise((resolve, reject) => {
                const propertyToUpdate = configuration.propertyToUpdate;
                const content = configuration.content;

                if (!isValidData(propertyToUpdate) || !content || !valueToSet) {
                    reject('Failed to find the property to update.');
                    return;
                }

                switch (propertyToUpdate.editor) {
                    case "Umbraco.NestedContent": {
                        if (!replace) {
                            propertyToUpdate[configuration.selectedPropertyAlias] = propertyToUpdate[configuration.selectedPropertyAlias] + valueToSet;
                            break;
                        }

                        propertyToUpdate[configuration.selectedPropertyAlias] = valueToSet;
                        break;
                    }
                    case "Umbraco.BlockList": {
                        propertyToUpdate[configuration.selectedPropertyAlias] = valueToSet;
                        break;
                    }
                    case "Umbraco.BlockGrid": {
                        if (!replace) {
                            propertyToUpdate[configuration.selectedPropertyAlias] = propertyToUpdate[configuration.selectedPropertyAlias] + valueToSet;
                            break;
                        }
                        propertyToUpdate[configuration.selectedPropertyAlias] = valueToSet;
                        break;
                    }
                    default: {
                        if (!replace) {
                            propertyToUpdate.value = propertyToUpdate.value + valueToSet;
                            break;
                        }
                        propertyToUpdate.value = valueToSet;
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
            const targetElementFromNestedContent = this.findElementByIdSuffix(configuration.nestedItemDetails);
            const targetElementFromBlockListContent = this.findElementByIdSuffix(configuration.selectedPropertyAlias);
            
            if (targetElementFromNestedContent.length || targetElementFromBlockListContent.length) {
                return { targetElement: targetElementFromNestedContent.length ? targetElementFromNestedContent : targetElementFromBlockListContent, propertyType: 'Text' };
            }

            if (configuration.propertyElement) {
                const imageElement = this.findImageElement(configuration.propertyElement);
                if (imageElement) {
                    return { targetElement: imageElement, propertyType: 'Image' };
                }
            }

            return { targetElement: null, propertyType: 'Image' };
        },
        findElementByIdSuffix: function (idSuffix) {
            return angular.element($document[0].querySelector(`input[id$="${idSuffix}"], textarea[id$="${idSuffix}"]`));
        },
        findImageElement: function (propertyElement) {
            const imageElement = propertyElement.find('img').first();
            return (imageElement.length && !imageElement[0]?.parentElement?.hasAttribute('unique-id')) ? imageElement : null;
        },
        updateContentInDOM: function (replace, propertyEditor, valueToSet) {
            const { targetElement, propertyType } = this.getTargetElement();
            
            if (targetElement) {
                if (propertyType === 'Text' && propertyEditor !== blockGridAlias) {
                    this.updateTextElement(targetElement, replace, valueToSet);
                } else {
                    targetElement.attr('src', valueToSet);
                }

                targetElement.triggerHandler('input');
            }

            if (!targetElement && propertyType === 'Image') {
                this.appendMediaItemTemplate(valueToSet);
            }
        },
        updateTextElement: function (targetElement, replace, valueToSet) {
            const currentText = targetElement.val();

            if (replace) {
                targetElement.val(valueToSet);
            } else {
                targetElement.val(currentText + '\n' + valueToSet);
            }
        },
        appendMediaItemTemplate: function (valueToSet) {
            const mediaPickerThumbnailList = configuration.propertyElement.find('.umb-sortable-thumbnails');
            if (mediaPickerThumbnailList.length > 0) {
                const mediaItemTemplate = `
                    <li class="umb-sortable-thumbnails__wrapper ng-scope" data-element="sortable-thumbnail-0">
                        <img src="${valueToSet}" alt="Generated Image" title="Generated Image">
                    </li>`;

                const addButtonWrapper = mediaPickerThumbnailList.find('.add-wrapper');
                debugger
                if (addButtonWrapper.length) {
                    addButtonWrapper.css('display', 'none');
                }
                mediaPickerThumbnailList.append(mediaItemTemplate);
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
            configuration.propertyElement = propertyElement;
            
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
        setSelectedProperty: function (event) {
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

            configuration.selectedPropertyAlias = selectedPropertyAlias;
            configuration.selectedPropertyEditorAlias = selectedPropertyEditorAlias;

            blockItemsService.setPropertyKey(selectedPropertyKey);
            nestedItemsService.setConfiguration(selectedPropertyKey, selectedPropertyAlias, dataElementValue);
            configuration.nestedItemDetails = dataElementValue;

            const {content, properties} = this.getPropertiesAndContent(editorState);
            const propertyToUpdate = this.findProperty(properties);
            
            configuration.content = content;
            configuration.propertyToUpdate = propertyToUpdate;

            return modalCaptionText;
        }
    }
});