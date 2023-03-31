using umContentCreator.Core.Models;

namespace umContentCreator.Core.Interfaces;

public interface IPropertiesService
{
    bool UpdatePropertyFromNestedContent(UpdatePropertyModel model);
}