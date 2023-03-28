using umContentCreator.Core.Models;

namespace umContentCreator.Core.Interfaces;

public interface IPropertiesService
{
    List<UmPropertyInfo> GetPropertiesByContentTypeKey(string contentTypeKey);
    bool UpdatePropertyFromNestedContent(UpdatePropertyModel model);
}