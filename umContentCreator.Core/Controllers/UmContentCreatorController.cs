using Microsoft.AspNetCore.Mvc;
using StackExchange.Profiling.Internal;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;
using umContentCreator.Core.Models.CreateImage;
using umContentCreator.Core.Models.CreateImage.GenerateImage;
using umContentCreator.Core.Models.CreateImage.SearchImage;

namespace umContentCreator.Core.Controllers;

[ApiController]
[Route("api/umContentCreator")]
public class UmContentCreatorController : Controller
{
    private readonly IChatGptService _chatGptService;
    private readonly IImagesGenerationService _imagesGenerationService;
    
    public UmContentCreatorController(IChatGptService chatGptService, IImagesGenerationService imagesGenerationService)
    {
        _chatGptService = chatGptService;
        _imagesGenerationService = imagesGenerationService;
    }

    [HttpPost("getGeneratedText")]
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

    [HttpPost("getGenerateImage")]
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

    [HttpPost("createMediaItemFromUrl")]
    public async Task<IActionResult> CreateMediaItemFromUrl([FromBody] CreateMediaItemModel model)
    {
        try
        {
            var guid = await _imagesGenerationService.CreateMediaItemFromUrlAsync(model);
            return Ok(guid);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(ex.Message);
        }
    }

    [HttpPost("searchImage")] 
    public async Task<IActionResult> SearchImage([FromBody] SearchImageModel model)
    {
        try
        {
            return Ok(await _imagesGenerationService.SearchImageAsync(model));
        }
        catch (InvalidOperationException ex)
        {
            return Problem(ex.Message);
        }
    }
}