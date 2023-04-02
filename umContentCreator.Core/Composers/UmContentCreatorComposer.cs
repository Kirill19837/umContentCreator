using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Services;

namespace umContentCreator.Core.Composers;

public class UmContentCreatorComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddTransient<ISettingsService, SettingsService>();
        builder.Services.AddTransient<IChatGptService, ChatGptService>();
    }
}