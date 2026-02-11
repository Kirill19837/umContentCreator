namespace umContentCreator.Core.Models;

public class SettingsModel
{
    public string TextApiKey { get; set; }
    public string TextModel { get; set; }
    public string GoogleApiKey { get; set; }
    public string CustomSearchEngineKey { get; set; }
    public string GoogleSearchRegion { get; set; }
    public string GoogleSearchRights { get; set; }
    public string StabilityApiKey { get; set; }
    public string StabilityApiModel { get; set; }
    public string PreferredImageModel { get; set; }
    public string AspectRatio { get; set; }

}