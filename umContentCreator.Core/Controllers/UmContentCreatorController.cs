using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;

namespace umContentCreator.Core.Controllers;

public class UmContentCreatorController : UmbracoApiController
{
    private readonly IChatGptService _chatGptService;
    private readonly IImagesGenerationService _imagesGenerationService;
    
    public UmContentCreatorController(IChatGptService chatGptService, IImagesGenerationService imagesGenerationService)
    {
        _chatGptService = chatGptService;
        _imagesGenerationService = imagesGenerationService;
    }

    [HttpPost]
    public async Task<IActionResult> GetGeneratedText([FromBody] GenerateTextModel model)
    {
        try
        {
            return Ok(await _chatGptService.GenerateTextAsync(model));
        }
        catch (InvalidOperationException ex)
        {
            return Problem(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> GetGeneratedImages([FromBody] GenerateImageModel model)
    {
        try
        {
            return Ok(await _imagesGenerationService.GenerateImageAsync(model));
        }
        catch (InvalidOperationException ex)
        {
            return Problem(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateMediaItemFromUrl([FromBody] CreateMediaItemModel model)
    {
        try
        {
            var guid = await _imagesGenerationService.CreateMediaItemFromUrlAsync(model.Url, model.MediaItemName);
            return Ok(guid.ToString("D"));
        }
        catch (InvalidOperationException ex)
        {
            return Problem(ex.Message);
        }
    }
}