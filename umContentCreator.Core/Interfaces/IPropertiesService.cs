using umContentCreator.Core.Models;

namespace umContentCreator.Core.Interfaces;

public interface IPropertiesService
{
    List<UmPropertyInfo> GetPropertiesByContentId(int contentId);
    bool UpdatePropertyFromNestedContent(UpdatePropertyModel model);
}