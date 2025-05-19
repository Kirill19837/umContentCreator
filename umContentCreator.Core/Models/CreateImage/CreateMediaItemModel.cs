namespace umContentCreator.Core.Models.CreateImage;

public class CreateMediaItemModel
{
    public string Url { get; set; }
    public string Base64 { get; set; }
    public MediaModel[] MediaFiles { get; set; }
    public string Alias { get; set; }
}