using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Web.Common;
using Umbraco.Extensions;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;
using umContentCreator.Core.Models.CreateImage;
using umContentCreator.Core.Models.CreateImage.GenerateImage;
using umContentCreator.Core.Models.CreateImage.SearchImage;
using Constants = umContentCreator.Core.Models.Constants;

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
    private readonly UmbracoHelper _umbracoHelper;
    
    public ImagesGenerationService(
        ISettingsService settingsService, 
        IMediaService mediaService, 
        MediaFileManager mediaFileManager, 
        MediaUrlGeneratorCollection mediaUrlGeneratorCollection, 
        IShortStringHelper shortStringHelper, 
        IContentTypeBaseServiceProvider contentTypeBaseServiceProvider,
        UmbracoHelper umbracoHelper)
    {
        _settingsService = settingsService;
        _mediaService = mediaService;
        _mediaFileManager = mediaFileManager;
        _mediaUrlGeneratorCollection = mediaUrlGeneratorCollection;
        _shortStringHelper = shortStringHelper;
        _contentTypeBaseServiceProvider = contentTypeBaseServiceProvider;
        _httpClient = new HttpClient();
        _umbracoHelper = umbracoHelper;
    }

    public async Task<string[]> GenerateImageAsync(GenerateImageModel model)
    {
        var settings = await _settingsService.LoadSettingsAsync();

        return settings.PreferredImageModel switch
        {
            "v2" => await GenerateImageAsyncV2(settings, model),
            _ => await GenerateImageAsyncV1(settings, model)
        };
    }

    public async Task<MediaModel> CreateMediaItemFromUrlAsync(CreateMediaItemModel model)
    {

        var folderId = -1;
        if (model.MediaFiles.Any())
        {
            var currentMedia = model.MediaFiles.FirstOrDefault();
            var currentMediaContent = _mediaService.GetById(currentMedia.MediaKey);
            folderId = currentMediaContent.ParentId;
        }

        byte[] imageBytes;
        var extension = ".png";

        if (!string.IsNullOrWhiteSpace(model.Url))
        {
            var uri = new Uri(model.Url);
            extension = Path.GetExtension(uri.AbsolutePath);
            imageBytes = await DownloadImageAsync(model.Url);
        }
        else
        {
            imageBytes = Convert.FromBase64String(model.Base64);
        }

        using var imageStream = new MemoryStream(imageBytes);

        var media = _mediaService.CreateMedia($"{model.Alias}-generate", folderId, "Image");

        media.SetValue(_mediaFileManager, _mediaUrlGeneratorCollection, _shortStringHelper, _contentTypeBaseServiceProvider, Umbraco.Cms.Core.Constants.Conventions.Media.File, $"{model.Alias}-generate.{extension}", imageStream);

        _mediaService.Save(media);

        return new MediaModel
        {
            Key = Guid.NewGuid(),
            MediaKey = media.Key
        };
    }

    public async Task<SearchImageResultModel> SearchImageAsync(SearchImageModel model)
    {
        var settings = await _settingsService.LoadSettingsAsync();

        int startIndex = (model.CurrentPage - 1) * model.PageSize + 1;

        var url = $"{Constants.GoogleSearchApiUrl}?num={model.PageSize}&q={model.Query}&filter=1&safe=active&searchType=image&cx={settings.CustomSearchEngineKey}&key={settings.GoogleApiKey}&start={startIndex}";

        if (!string.IsNullOrWhiteSpace(settings.GoogleSearchRegion))
        {
            url += $"&cr=country{settings.GoogleSearchRegion}&gl={settings.GoogleSearchRegion.ToLower()}";
        }

        if (!string.IsNullOrWhiteSpace(settings.GoogleSearchRights))
        {
            url += $"&rights={settings.GoogleSearchRights}";
        }

        var response = await _httpClient.GetAsync(url);

        var content = await response.Content.ReadAsStringAsync();
        
        var json = JObject.Parse(content);

        var imageUrls = json["items"]?.Select(i => (string)i["link"]).ToList();

        var totalResultsStr = json["searchInformation"]?["totalResults"]?.ToString();
        var totalResults = 0;

        if (long.TryParse(totalResultsStr, out long totalLong))
            totalResults = (int)Math.Min(totalLong, 10);

        return new SearchImageResultModel
        {
            Images = imageUrls,
            TotalResults = totalResults
        };
    }

    private async Task<byte[]> DownloadImageAsync(string url)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        request.Headers.Add("Accept", "*/*");
        request.Headers.Add("Accept-Encoding", "gzip, deflate, br");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Failed to load an image. Status code: {response.StatusCode}");
        }

        return await response.Content.ReadAsByteArrayAsync();
    }

    // Stability API v1
    private async Task<string[]> GenerateImageAsyncV1(SettingsModel settings, GenerateImageModel model)
    {
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", settings.StabilityApiKey);
        _httpClient.DefaultRequestHeaders.Accept.Clear();
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var promptObject = new
        {
            cfg_scale = 7,
            clip_guidance_preset = "FAST_BLUE",
            height = 1024,
            width = 1024,
            sampler = "K_DPM_2_ANCESTRAL",
            samples = model.NumberOfImages,
            steps = 30,
            text_prompts = new[]
            {
            new { text = "illustration " + model.Prompt, weight = 1 },
            new { text = model.NegativePrompts , weight = -1 },
            }
        };

        var content = CreateJsonContent(promptObject);

        try
        {
            var response = await _httpClient.PostAsync(Constants.StabilityApiUrlv1, content);

            if (!response.IsSuccessStatusCode)
            {
                return Array.Empty<string>();
            }

            var responseData = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ArtifactsModel>(responseData);

            return result?.Artifacts?
                .Where(x => string.Equals(x.FinishReason, "success", StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Base64)
                .ToArray()
                ?? Array.Empty<string>();
        }
        catch (Exception ex)
        {
            return Array.Empty<string>();
        }
    }

    // Stability API v2
    private async Task<string[]> GenerateImageAsyncV2(SettingsModel settings, GenerateImageModel model)
    {
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", settings.StabilityApiKey);
        _httpClient.DefaultRequestHeaders.Accept.Clear();
        _httpClient.DefaultRequestHeaders.Add("Accept", "image/*");

        var results = new List<string>();

        for (int i = 0; i < model.NumberOfImages; i++)
        {
            using var content = new MultipartFormDataContent();

            // PROMPT
            var promptContent = new StringContent($"illustration {model.Prompt}");
            promptContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                Name = "\"prompt\""
            };
            content.Add(promptContent);

            // NEGATIVE PROMPT
            if (!string.IsNullOrWhiteSpace(model.NegativePrompts))
            {
                var negativePromptContent = new StringContent(model.NegativePrompts);
                negativePromptContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
                {
                    Name = "\"negative_prompt\""
                };
                content.Add(negativePromptContent);
            }

            // ASPECT RATIO
            var aspectRatioContent = new StringContent(settings.AspectRatio);
            aspectRatioContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                Name = "\"aspect_ratio\""
            };
            content.Add(aspectRatioContent);

            // OUTPUT FORMAT
            var outputFormatContent = new StringContent("webp");
            outputFormatContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                Name = "\"output_format\""
            };
            content.Add(outputFormatContent);

            var response = await _httpClient.PostAsync(
                $"{Constants.StabilityApiUrlv2}/{settings.StabilityApiModel}",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                throw new Exception(
                    $"Stability error {(int)response.StatusCode}: {errorBody}"
                );
            }

            var bytes = await response.Content.ReadAsByteArrayAsync();
            results.Add(Convert.ToBase64String(bytes));
        }

        return results.ToArray();
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

    private StringContent CreateJsonContent(object data)
    {
        var json = JsonConvert.SerializeObject(data);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }
}