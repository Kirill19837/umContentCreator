using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;

namespace umContentCreator.Core.Controllers;

public class UmContentCreatorController : UmbracoApiController
{
    private readonly IChatGptService _chatGptService;
    
    public UmContentCreatorController(IChatGptService chatGptService)
    {
        _chatGptService = chatGptService;
    }

    [HttpPost]
    public async Task<IActionResult> GetGeneratedText([FromBody] GenerateTextModel model)
    {
        return Ok(await _chatGptService.GenerateTextAsync(model));
    }
}