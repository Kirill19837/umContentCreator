using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Controllers;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;

namespace umContentCreator.Core.Controllers;

public class UmContentCreatorController : UmbracoApiController
{
    private readonly IChatGptService _chatGptService;
    private readonly IContentService _contentService;
    private readonly IContentTypeService _contentTypeService;
    
    public UmContentCreatorController(IContentTypeService contentTypeService, IContentService contentService,
        IChatGptService chatGptService)
    {
        _contentTypeService = contentTypeService;
        _contentService = contentService;
        _chatGptService = chatGptService;
    }

    [HttpGet]
    public IActionResult GetProperties([FromQuery] int contentId)
    {
        var content = _contentService.GetById(contentId);

        if (content is null) return NotFound();

        var contentType = _contentTypeService.Get(content.ContentTypeId);
        
        var properties = contentType.PropertyTypes
            .Where(pt => pt.PropertyEditorAlias is "Umbraco.TextBox" or "Umbraco.TinyMCE" or "Umbraco.TextArea")
            .Select(pt => new UmPropertyInfo
            {
                PropertyName = pt.Name,
                PropertyAlias = pt.Alias
            });

        return Ok(properties);
    }

    [HttpPost]
    public async Task<IActionResult> GetGeneratedText([FromBody] GenerateTextModel model)
    {
        return Ok(await _chatGptService.GenerateTextAsync(model));
    }
}