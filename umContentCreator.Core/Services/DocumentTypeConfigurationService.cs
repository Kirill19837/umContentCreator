using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Constants = Umbraco.Cms.Core.Constants;


namespace umContentCreator.Core.Services
{
    public class DocumentTypeConfigurationService : IDocumentTypeConfigurationService
    {
        private readonly IContentTypeService _contentTypeService;
        private readonly IDataTypeService _dataTypeService;
        private readonly IConfigurationEditorJsonSerializer _configurationEditorJsonSerializer;




        public DocumentTypeConfigurationService(
            IContentTypeService contentTypeService, 
            IDataTypeService dataTypeService, 
            IConfigurationEditorJsonSerializer configurationEditorJsonSerializer)
        {
            _contentTypeService = contentTypeService;
            _dataTypeService = dataTypeService;
            _configurationEditorJsonSerializer = configurationEditorJsonSerializer;
        }

        public async Task UpdateAliasesAsync(UpdateDocumentTypeModel model)
        {
            var customTextBox = await CreateCustomDataTypeAsync("Umb.PropertyEditorUi.OskiTextBox", "Umbraco.TextBox", "Oski TextBox - Generate Text");
            var customMediaPicker = await CreateCustomDataTypeAsync("Umb.PropertyEditorUi.OskiMediaPicker", "Umbraco.MediaPicker3", "Oski MediaPicker - Generate Image");
            var customTextArea = await CreateCustomDataTypeAsync("Umb.PropertyEditorUi.OskiTexArea", "Umbraco.TextArea", "Oski TextArea - Generate Text");

            var alliasArray = model.Aliases.Split(',');


            var contentTypes = _contentTypeService.GetAllContentTypeIds(alliasArray);

            foreach (var contentTypeId in contentTypes)
            {
                var contentType = _contentTypeService.Get(contentTypeId);
                foreach (var dataType in contentType.PropertyTypes)
                {
                    if (dataType.PropertyEditorAlias == Constants.PropertyEditors.Aliases.TextBox)
                    {
                        dataType.DataTypeKey = Guid.NewGuid();
                        dataType.PropertyEditorAlias = customTextBox.EditorAlias;
                        dataType.DataTypeId = customTextBox.Id; ;
                    }
                    if(dataType.PropertyEditorAlias == Constants.PropertyEditors.Aliases.MediaPicker3)
                    {
                        dataType.DataTypeKey = Guid.NewGuid();
                        dataType.PropertyEditorAlias = customMediaPicker.EditorAlias;
                        dataType.DataTypeId = customMediaPicker.Id; ;
                    }
                    if(dataType.PropertyEditorAlias == Constants.PropertyEditors.Aliases.TextArea)
                    {
                        dataType.DataTypeKey = Guid.NewGuid();
                        dataType.PropertyEditorAlias = customTextArea.EditorAlias;
                        dataType.DataTypeId = customTextArea.Id; ;
                    }

                }
                await _contentTypeService.UpdateAsync(contentType, Constants.Security.SuperUserKey);

            }

        }

        private async Task<DataType> CreateCustomDataTypeAsync(string uiAlias, string defaultAlias, string name)
        {
            var customDataTypes = await _dataTypeService.GetByEditorUiAlias(uiAlias);
            if (customDataTypes.Any())
            {
                return (DataType)customDataTypes.FirstOrDefault();
            }
            else
            {
                var defaultDataTypes = await _dataTypeService.GetByEditorAliasAsync(defaultAlias);

                if (defaultDataTypes.Any())
                {
                    var defaultDataType = defaultDataTypes.FirstOrDefault();


                    var customDataType = new DataType(defaultDataType.Editor, _configurationEditorJsonSerializer)
                    {
                        ConfigurationData = defaultDataType.ConfigurationData,
                        DatabaseType = defaultDataType.DatabaseType,
                        Editor = defaultDataType.Editor,
                        EditorUiAlias = uiAlias,
                        Name = name
                    };

                    await _dataTypeService.CreateAsync(customDataType, Constants.Security.SuperUserKey);
                    await _dataTypeService.UpdateAsync(customDataType, Constants.Security.SuperUserKey);

                    return customDataType;

                }
             }

            return null;
        } 


    }
}
