using umContentCreator.Core.Models;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;

namespace umContentCreator.Core.Interfaces;

public interface IImagesGenerationService
{
    Task<string[]> GenerateImageAsync(GenerateImageModel model);
    Task<Guid> CreateMediaItemFromUrlAsync(string url, string mediaItemName);
}