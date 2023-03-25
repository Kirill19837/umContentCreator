using umContentCreator.Core.Models;

namespace umContentCreator.Core.Interfaces;

public interface IChatGptService
{
    Task<string> GenerateTextAsync(GenerateTextModel model);
}