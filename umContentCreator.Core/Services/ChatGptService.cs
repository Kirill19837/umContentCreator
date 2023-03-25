using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;

namespace umContentCreator.Core.Services;

public class ChatGptService : IChatGptService
{
    private readonly HttpClient _httpClient;
    private readonly ISettingsService _settingsService;

    public ChatGptService(ISettingsService settingsService)
    {
        _settingsService = settingsService;
        _httpClient = new HttpClient();
    }

    public async Task<string> GenerateTextAsync(GenerateTextModel model)
    {
        var settings = await _settingsService.LoadSettingsAsync();
        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", settings.ApiKey);

        var requestBody = JsonConvert.SerializeObject(new
        {
            model = settings.ChatGPTModel,
            prompt = model.Prompt,
            temperature = model.Temperature,
            max_tokens = model.MaxTokens
        });

        var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(settings.BaseApiUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception("Failed to generate text from ChatGPT API.");
        }
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseObject = JsonConvert.DeserializeObject<dynamic>(responseContent);
        return AddParagraphsToText(responseObject.choices[0].text.ToString(), 50);
    }
    
    public static string AddParagraphsToText(string text, int wordsPerParagraph)
    {
        string[] words = text.Split(' ');
        StringBuilder formattedText = new StringBuilder();
        int wordCount = 0;

        foreach (string word in words)
        {
            formattedText.Append(word + " ");
            wordCount++;

            if (wordCount % wordsPerParagraph == 0)
            {
                formattedText.Append("\n\n");
            }
        }

        return formattedText.ToString();
    }
}