using umContentCreator.Core.Models;

namespace umContentCreator.Core.Interfaces
{
    public interface IDocumentTypeConfigurationService
    {
        Task UpdateAliasesAsync(UpdateDocumentTypeModel model);
    }
}
