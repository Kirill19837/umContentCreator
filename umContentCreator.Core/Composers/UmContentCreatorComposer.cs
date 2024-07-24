using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using umContentCreator.Core.Handles;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Services;

namespace umContentCreator.Core.Composers;

public class UmContentCreatorComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddTransient<ISettingsService, SettingsService>();
        builder.Services.AddTransient<IChatGptService, ChatGptService>();
        builder.Services.AddTransient<IImagesGenerationService, ImagesGenerationService>();
        builder.AddNotificationHandler<ServerVariablesParsingNotification,
                ServerVariablesParsingNotificationHandler>();
    }
}