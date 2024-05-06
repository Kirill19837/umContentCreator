using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json.Linq;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Media;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;
using Constants = umContentCreator.Core.Models.Constants;
using Azure;
using Azure.AI.OpenAI;

namespace umContentCreator.Core.Services;

public class ImagesGenerationService : IImagesGenerationService
{
    private readonly ISettingsService _settingsService;
    private readonly MediaFileManager _mediaFileManager;
    private readonly MediaUrlGeneratorCollection _mediaUrlGeneratorCollection;
    private readonly IShortStringHelper _shortStringHelper;
    private readonly IContentTypeBaseServiceProvider _contentTypeBaseServiceProvider;
    private readonly IMediaService _mediaService;
    private readonly HttpClient _httpClient;
    
    public ImagesGenerationService(ISettingsService settingsService, IMediaService mediaService, MediaFileManager mediaFileManager, MediaUrlGeneratorCollection mediaUrlGeneratorCollection, IShortStringHelper shortStringHelper, IContentTypeBaseServiceProvider contentTypeBaseServiceProvider)
    {
        _settingsService = settingsService;
        _mediaService = mediaService;
        _mediaFileManager = mediaFileManager;
        _mediaUrlGeneratorCollection = mediaUrlGeneratorCollection;
        _shortStringHelper = shortStringHelper;
        _contentTypeBaseServiceProvider = contentTypeBaseServiceProvider;
        _httpClient = new HttpClient();
    }

    public async Task<string[]> GenerateImageAsync(GenerateImageModel model)
    {
        var settings = await _settingsService.LoadSettingsAsync();
        OpenAIClient client = new OpenAIClient(settings.ApiKey);

        var imageSize = new Azure.AI.OpenAI.ImageSize(model.ImageSize);
        var imageQuality = new Azure.AI.OpenAI.ImageGenerationQuality(model.ImageQuality);
        string ImageModel = (imageSize == ImageSize.Size1792x1024 || imageSize == ImageSize.Size1024x1792 || imageSize == ImageSize.Size1024x1024) ? "dall-e-3" : "dall-e-2";

        Response<ImageGenerations> response = await client.GetImageGenerationsAsync(
        new ImageGenerationOptions()
        {
            DeploymentName = ImageModel,
            Prompt = model.Prompt,
            Size = imageSize,
            Quality = imageQuality,
            ImageCount = model.NumberOfImages
        });
        return response.Value.Data?.Select(item => item.Url?.ToString()).Where(imageUrl => !string.IsNullOrEmpty(imageUrl)).ToArray();
    }

    public async Task<Guid> CreateMediaItemFromUrlAsync(string url, string mediaItemName)
    {
        var imageBytes = await DownloadImageAsync(url);

        using var imageStream = new MemoryStream(imageBytes);

        var parentFolder = _mediaService.GetByLevel(1)
            ?.FirstOrDefault(m => m.ContentType.Alias == "Folder" && m.Name == Constants.FolderName);

        if (parentFolder == null)
        {
            parentFolder = _mediaService.CreateMedia(Constants.FolderName, -1, "Folder");
            _mediaService.Save(parentFolder);
        }

        var folderId = HandleMediaWithTheSameNames(mediaItemName, parentFolder.Id) ?? parentFolder.Id;

        var media = _mediaService.CreateMedia(mediaItemName, folderId, "Image");

        media.SetValue(_mediaFileManager, _mediaUrlGeneratorCollection, _shortStringHelper, _contentTypeBaseServiceProvider, Umbraco.Cms.Core.Constants.Conventions.Media.File, $"{mediaItemName}.png", imageStream);

        _mediaService.Save(media);
        return media.Key;
    }

    private async Task<byte[]> DownloadImageAsync(string url)
    {
        var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Failed to load an image.");
        }

        return await response.Content.ReadAsByteArrayAsync();;
    }

    private int? HandleMediaWithTheSameNames(string mediaItemName, int parentFolderId)
    {
        var mediaFromFolder = _mediaService.GetPagedChildren(parentFolderId, 0, int.MaxValue, out _).ToList();
        var mediaWithTheSameName =
            mediaFromFolder.Where(m => m.Name == mediaItemName && m.ContentType.Alias == "Image").ToList();

        var folderForMediaWithTheSameName = mediaFromFolder.FirstOrDefault(f => f.Name == $"{mediaItemName} images" && f.ContentType.Alias == "Folder");

        if (!mediaWithTheSameName.Any() && folderForMediaWithTheSameName == null)
        {
            return null;
        }

        if (folderForMediaWithTheSameName == null)
        {
            folderForMediaWithTheSameName = _mediaService.CreateMedia($"{mediaItemName} images", parentFolderId, "Folder");
            _mediaService.Save(folderForMediaWithTheSameName);
        }

        foreach (var m in mediaWithTheSameName)
        {
            _mediaService.Move(m, folderForMediaWithTheSameName.Id);
        }

        return folderForMediaWithTheSameName.Id;
    }
}