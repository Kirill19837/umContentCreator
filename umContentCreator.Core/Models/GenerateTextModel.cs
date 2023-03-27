namespace umContentCreator.Core.Models;

public class GenerateTextModel
{
    public string Prompt { get; set; }
    public int MaxTokens { get; set; }
    public double Temperature { get; set; }
    public string PropertyEditorAlias { get; set; }
}