namespace umContentCreator.Core.Models.CreateImage.GenerateImage;

public class GenerateImageModel
{
    public string Prompt { get; set; }
    public int NumberOfImages { get; set; }
    public string NegativePrompts { get; set; }

}