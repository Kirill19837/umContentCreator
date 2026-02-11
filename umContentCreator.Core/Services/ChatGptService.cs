using Azure;
using Azure.AI.OpenAI;
using MarkdownSharp;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;
using static Umbraco.Cms.Core.Constants.PropertyEditors.Aliases;



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

        OpenAIClient client = new OpenAIClient(settings.TextApiKey);
        var chatCompletionsOptions = new ChatCompletionsOptions()
        {
            DeploymentName = settings.TextModel,
            Messages =
                {
                    new ChatRequestSystemMessage(model.Prompt)
                }
        };
        Response<ChatCompletions> response = await client.GetChatCompletionsAsync(chatCompletionsOptions);
        ChatResponseMessage responseMessage = response.Value.Choices[0].Message;
        var returnedText = await GetGeneratedText(response);

        return model.PropertyEditorAlias is RichText ? new Markdown().Transform(returnedText) : returnedText;
    }

    private static async Task<string> GetGeneratedText(Response<ChatCompletions> response)
    {
        var returnedText = response.Value.Choices[0].Message;
        return returnedText.Content.Trim('"');
    }
}