using Umbraco.Cms.Core.Models;

namespace umContentCreator.Core.Interfaces;

public interface IUmContentCreatorInjectorService
{
    void AddUmContentCreatorToExistingContentTypes(IEnumerable<IContentType> contentTypes);
}