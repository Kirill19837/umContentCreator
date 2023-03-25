using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;

namespace umContentCreator.Core.Controllers;

public class ConfigurationController : UmbracoApiController
{
    private readonly ISettingsService _settingsService;

    public ConfigurationController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<IActionResult> LoadSettings()
    {
        return Ok(await _settingsService.LoadSettingsAsync());
    }

    [HttpPost]
    public async Task<IActionResult> SaveSettings([FromBody] SettingsModel settings)
    {
        await _settingsService.SaveSettingsAsync(settings);
        return Ok();
    }

    [HttpGet]
    public IActionResult GetAvailableModels()
    {
        var models = new[]
        {
            "text-davinci-003",
            "text-curie-001",
            "text-babbage-001",
            "text-ada-001"
        };
        return Ok(models);
    }
}