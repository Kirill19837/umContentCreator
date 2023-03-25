using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;
using umContentCreator.Core.Interfaces;

namespace umContentCreator.Core.Services;

public class UmContentCreatorInjectorService : IUmContentCreatorInjectorService
{
    private readonly IDataTypeService _dataTypeService;
    private readonly IShortStringHelper _shortStringHelper;
    private bool _contentModified = false;
    
    public UmContentCreatorInjectorService(IDataTypeService dataTypeService, IShortStringHelper shortStringHelper)
    {
        _dataTypeService = dataTypeService;
        _shortStringHelper = shortStringHelper;
    }

    public void AddUmContentCreatorToExistingContentTypes(IEnumerable<IContentType> contentTypes)
    {
        const string propertyEditorAlias = "umContentCreator";
        const string propertyName = "Content Creator";
        const string propertyTabName = "Content Creator";

        var dataType = _dataTypeService.GetByEditorAlias(propertyEditorAlias).FirstOrDefault();

        if (dataType == null)
        {
            return;
        }
        
        foreach (var contentType in contentTypes)
        {
            if (contentType.PropertyTypeExists(propertyEditorAlias)) continue;

            var contentCreatorTab = contentType.PropertyGroups.FirstOrDefault(x => x.Name == propertyTabName);

            if (contentCreatorTab == null)
            {
                contentCreatorTab = new PropertyGroup(new PropertyTypeCollection(true))
                {
                    Name = propertyTabName,
                    Alias = propertyTabName.ToSafeAlias(_shortStringHelper)
                };
                contentType.PropertyGroups.Add(contentCreatorTab);
            }

            var contentCreatorPropertyType = new PropertyType(_shortStringHelper, dataType, propertyEditorAlias)
            {
                Name = propertyName,
                Description = "Automatically added Content Creator property",
                Mandatory = false
            };

            contentCreatorTab.PropertyTypes.Add(contentCreatorPropertyType);
            _contentModified = true;
        }
    }

    public bool GetContentModificationStatus()
    {
        return _contentModified;
    }
}