using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Infrastructure.Serialization;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.PropertyEditors;
using static Umbraco.Cms.Core.Constants.PropertyEditors.Aliases;
using IPropertyType = Umbraco.Cms.Core.Models.IPropertyType;

namespace umContentCreator.Core.Services;

public class UmContentCreatorInjectorService : IUmContentCreatorInjectorService
{
    private readonly IDataTypeService _dataTypeService;
    private readonly IShortStringHelper _shortStringHelper;
    private readonly IDataValueEditorFactory _editorFactory;

    public UmContentCreatorInjectorService(IDataTypeService dataTypeService, IShortStringHelper shortStringHelper, IDataValueEditorFactory editorFactory)
    {
        _dataTypeService = dataTypeService;
        _shortStringHelper = shortStringHelper;
        _editorFactory = editorFactory;
    }

    public void AddUmContentCreatorToExistingContentTypes(IEnumerable<IContentType> contentTypes)
    {
        const string propertyEditorAlias = "umContentCreator";

        var dataType = GetDataType(propertyEditorAlias);

        foreach (var contentType in contentTypes)
        {
            var contentCreatorPropertyTypes = new List<(IPropertyType propertyType, IPropertyType targetPropertyType)>();

            foreach (var propertyType in contentType.CompositionPropertyTypes)
            {
                if (propertyType.PropertyEditorAlias is not (TinyMce or TextArea or TextBox))
                {
                    continue;
                }
                var contentCreatorPropertyAlias = $"{propertyEditorAlias}__{propertyType.Alias}__{propertyType.PropertyEditorAlias}";

                if (contentType.PropertyTypeExists(contentCreatorPropertyAlias))
                {
                    continue;
                }
                
                var contentCreatorPropertyType =
                    new PropertyType(_shortStringHelper, dataType, contentCreatorPropertyAlias)
                    {
                        Name = propertyType.Name + " Content Creator",
                        Description = "Automatically added Content Creator property",
                        Mandatory = false
                    };

                contentCreatorPropertyTypes.Add((contentCreatorPropertyType, propertyType));
            }

            foreach (var (propertyType, targetPropertyType) in contentCreatorPropertyTypes)
            {
                var propertyGroup =
                    contentType.CompositionPropertyGroups.FirstOrDefault(pg => pg.PropertyTypes.Contains(targetPropertyType));
                
                propertyGroup?.PropertyTypes?.Add(propertyType);
            }
        }
    }

   private IDataType GetDataType(string propertyEditorAlias)
    {
        var dataType = _dataTypeService.GetByEditorAlias(propertyEditorAlias).FirstOrDefault();
        if (dataType != null)
        {
            return dataType;
        }
        
        var editor = new UmContentCreator(_editorFactory);
        dataType = new DataType(editor, new ConfigurationEditorJsonSerializer())
        {
            Name = "umContentCreator"
        };
        _dataTypeService.Save(dataType);

        return dataType;
    }
}