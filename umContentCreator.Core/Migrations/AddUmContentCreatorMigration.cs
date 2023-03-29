using Serilog;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using umContentCreator.Core.Interfaces;

namespace umContentCreator.Core.Migrations;

public class AddUmContentCreatorMigration : MigrationBase
{
    private readonly IUmContentCreatorInjectorService _contentCreatorInjectorService;
    private readonly IContentTypeService _contentTypeService;
    private readonly ILogger _logger;

    public AddUmContentCreatorMigration(
        IContentTypeService contentTypeService,
        IUmContentCreatorInjectorService contentCreatorInjectorService,
        ILogger logger,
        IMigrationContext migrationContext) : base(migrationContext)
    {
        _contentTypeService = contentTypeService;
        _contentCreatorInjectorService = contentCreatorInjectorService;
        _logger = logger;
    }

    protected override void Migrate()
    {
        try
        {
            var contentTypes = _contentTypeService.GetAll().ToList();
            _contentCreatorInjectorService.AddUmContentCreatorToExistingContentTypes(contentTypes);
            _contentTypeService.Save(contentTypes);
        }
        catch (Exception ex)
        {
            _logger.Error(ex.Message);
        }
    }
}