using umContentCreator.Core.Models;

namespace umContentCreator.Core.Interfaces;

public interface IPropertiesService
{
    List<UmPropertyInfo> GetPropertiesOfContent(string contentTypeKey, int contentId);
    bool UpdatePropertyFromNestedContent(UpdatePropertyModel model);
}