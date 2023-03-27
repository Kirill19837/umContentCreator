using Umbraco.Cms.Core.PropertyEditors;

namespace umContentCreator.Core.PropertyEditors;

[DataEditor(
    alias: "umContentCreator",
    name: "Content Creator",
    view: "~/App_Plugins/UmContentCreator/Views/umContentCreator.html")]
public class UmContentCreator : DataEditor
{
    public UmContentCreator(IDataValueEditorFactory dataValueEditorFactory) : base(dataValueEditorFactory)
    {
    }
}