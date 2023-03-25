using Newtonsoft.Json;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;

namespace umContentCreator.Core.Services;

public class SettingsService : ISettingsService
{
    private const string _settingsFilePath = "umContentCreatorSettings.json";

    public async Task<SettingsModel> LoadSettingsAsync()
    {
        if (!File.Exists(_settingsFilePath))
        {
            return new SettingsModel();
        }

        using var reader = File.OpenText(_settingsFilePath);
        var json = await reader.ReadToEndAsync();
        return JsonConvert.DeserializeObject<SettingsModel>(json);
    }
    
    public async Task SaveSettingsAsync(SettingsModel settings)
    {
        var json = JsonConvert.SerializeObject(settings, Formatting.Indented);
        await File.WriteAllTextAsync(_settingsFilePath, json);
    }
}