using umContentCreator.Core.Models.CreateImage;
using umContentCreator.Core.Models.CreateImage.GenerateImage;
using umContentCreator.Core.Models.CreateImage.SearchImage;
namespace umContentCreator.Core.Interfaces;

public interface IImagesGenerationService
{
    Task<string[]> GenerateImageAsync(GenerateImageModel model);
    Task<MediaModel> CreateMediaItemFromUrlAsync(CreateMediaItemModel model);
    Task<SearchImageResultModel> SearchImageAsync(SearchImageModel model);
}