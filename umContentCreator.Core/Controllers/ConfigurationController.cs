using Microsoft.AspNetCore.Mvc;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;

namespace umContentCreator.Core.Controllers;

[ApiController]
[Route("api/configuration")]
public class ConfigurationController : Controller
{
    private readonly ISettingsService _settingsService;

    public ConfigurationController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet("loadSettings")]
    public async Task<IActionResult> LoadSettings()
    {
        return Ok(await _settingsService.LoadSettingsAsync());
    }

    [HttpPost("saveSettings")]
    public async Task<IActionResult> SaveSettings([FromBody] SettingsModel settings)
    {
        await _settingsService.SaveSettingsAsync(settings);
        return Ok();
    }
}