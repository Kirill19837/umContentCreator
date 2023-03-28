using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;

namespace umContentCreator.Core.Controllers;

public class UmContentCreatorController : UmbracoApiController
{
    private readonly IChatGptService _chatGptService;
    private readonly IPropertiesService _propertiesService;
    
    public UmContentCreatorController(IChatGptService chatGptService, IPropertiesService propertiesService)
    {
        _chatGptService = chatGptService;
        _propertiesService = propertiesService;
    }

    [HttpPost]
    public async Task<IActionResult> GetGeneratedText([FromBody] GenerateTextModel model)
    {
        return Ok(await _chatGptService.GenerateTextAsync(model));
    }

    [HttpGet]
    public IActionResult GetProperties([FromQuery] string contentTypeKey)
    {
        return Ok(_propertiesService.GetPropertiesByContentTypeKey(contentTypeKey));
    }

    [HttpPost]
    public IActionResult UpdateNestedContentProperty([FromBody] UpdatePropertyModel model)
    {
        try
        {
            var success = _propertiesService.UpdatePropertyFromNestedContent(model);
            
            if (success)
            {
                return Ok();
            }
        }
        catch (Exception e)
        {
            return Problem(e.Message);
        }
        
        return Ok();
    }
}