using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using umContentCreator.Core.Handles;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Services;

namespace umContentCreator.Composers
{
    public class umContentCreatorComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddScoped<ISettingsService, SettingsService>();
            builder.Services.AddScoped<IChatGptService, ChatGptService>();
            builder.Services.AddScoped<IImagesGenerationService, ImagesGenerationService>();
            builder.Services.AddScoped<IDocumentTypeConfigurationService, DocumentTypeConfigurationService>();
            builder.Services.AddScoped<INotificationHandler<ServerVariablesParsingNotification>, ServerVariablesParsingNotificationHandler>();
        }



    }
}
