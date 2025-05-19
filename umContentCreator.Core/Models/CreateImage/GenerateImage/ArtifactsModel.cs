using Newtonsoft.Json;

namespace umContentCreator.Core.Models.CreateImage.GenerateImage
{
    public class ArtifactsModel
    {
        [JsonProperty("artifacts")]
        public IEnumerable<ArtifactModel> Artifacts { get; set; } = Enumerable.Empty<ArtifactModel>();
    }
}
