namespace umContentCreator.Core.Models;

public class GenerateImageModel
{
    public string Prompt { get; set; }
    public int NumberOfImages { get; set; }
    public string ImageSize { get; set; }
    public string ImageQuality { get; set; }
}