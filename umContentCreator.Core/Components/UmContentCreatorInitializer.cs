using Serilog;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Services;
using umContentCreator.Core.Interfaces;

namespace umContentCreator.Core.Components;

public class UmContentCreatorInitializer : IComponent
{
    private readonly IUmContentCreatorInjectorService _contentCreatorInjectorService;
    private readonly IContentTypeService _contentTypeService;
    private readonly ILogger _logger;

    public UmContentCreatorInitializer(IContentTypeService contentTypeService, IUmContentCreatorInjectorService contentCreatorInjectorService, ILogger logger)
    {
        _contentTypeService = contentTypeService;
        _contentCreatorInjectorService = contentCreatorInjectorService;
        _logger = logger;
    }

    public void Initialize()
    {
        try
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
        catch (Exception ex)
        {
            _logger.Error(ex.Message);
        }
    }

    public void Terminate()
    {
    }
}