namespace umContentCreator.Core.Models;

public class GenerateImageModel
{
    public string Prompt { get; set; }
    public int NumberOfImages { get; set; }
    public int ImageSize { get; set; }
}