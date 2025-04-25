using Newtonsoft.Json;

namespace umContentCreator.Core.Models.CreateImage.GenerateImage
{
    public class ArtifactModel
    {
        [JsonProperty("base64")]
        public string Base64 { get; set; }

        [JsonProperty("seed")]
        public long Seed { get; set; }

        [JsonProperty("finishReason")]
        public string FinishReason { get; set; }
    }
}
