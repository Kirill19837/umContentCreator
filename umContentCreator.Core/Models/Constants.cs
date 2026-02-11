namespace umContentCreator.Core.Models;

public static class Constants
{
    public static string ChatGptApiUrl = "https://api.openai.com/v1/completions";
    public static string ChatGptModel = "text-davinci-003";
    public static string DalleApiUrl = "https://api.openai.com/v1/images/generations";
    public static string FolderName = "Generated Images";
    public static string ImageSize = "256x256";
    public static string GoogleSearchApiUrl = "https://customsearch.googleapis.com/customsearch/v1";
    public static string StabilityApiUrlv1 = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
    public static string StabilityApiUrlv2 = "https://api.stability.ai/v2beta/stable-image/generate";
}