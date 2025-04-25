using Microsoft.AspNetCore.Mvc;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;


namespace umContentCreator.Core.Controllers
{

    [ApiController]
    [Route("api/configurationDocumentType")]
    public class ConfigurationDocumentTypeController : Controller
    {
        private readonly IDocumentTypeConfigurationService _documentTypeConfigurationService;


        public ConfigurationDocumentTypeController(IDocumentTypeConfigurationService documentTypeConfigurationService)
        {
            _documentTypeConfigurationService = documentTypeConfigurationService;
        }

        [HttpPost("updateAliases")]
        public async Task<IActionResult> UpdateAliases(UpdateDocumentTypeModel model)
        {
            await _documentTypeConfigurationService.UpdateAliasesAsync(model);
            return Ok();
        }
    }
}
