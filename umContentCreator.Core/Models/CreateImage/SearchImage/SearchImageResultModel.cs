namespace umContentCreator.Core.Models.CreateImage.SearchImage
{
    public class SearchImageResultModel
    {
        public IEnumerable<string> Images { get; set; } = [];
        public int TotalResults { get; set; }
    }
}
