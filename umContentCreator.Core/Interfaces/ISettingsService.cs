using umContentCreator.Core.Models;

namespace umContentCreator.Core.Interfaces;

public interface ISettingsService
{
    Task<SettingsModel> LoadSettingsAsync();
    Task SaveSettingsAsync(SettingsModel settings);
}