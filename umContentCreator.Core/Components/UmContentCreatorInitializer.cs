using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Services;
using umContentCreator.Core.Interfaces;

namespace umContentCreator.Core.Components;

public class UmContentCreatorInitializer : IComponent
{
    private readonly IUmContentCreatorInjectorService _contentCreatorInjectorService;
    private readonly IContentTypeService _contentTypeService;

    public UmContentCreatorInitializer(IContentTypeService contentTypeService, IUmContentCreatorInjectorService contentCreatorInjectorService)
    {
        _contentTypeService = contentTypeService;
        _contentCreatorInjectorService = contentCreatorInjectorService;
    }

    public void Initialize()
    {
        var contentTypes = _contentTypeService.GetAll();
        _contentCreatorInjectorService.AddUmContentCreatorToExistingContentTypes(contentTypes);
        var contentModified = _contentCreatorInjectorService.GetContentModificationStatus();

        if (!contentModified)
        {
            return;
        }
        _contentTypeService.Save(contentTypes);
    }

    public void Terminate()
    {
    }
}