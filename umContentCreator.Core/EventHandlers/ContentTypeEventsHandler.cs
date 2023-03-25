using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using umContentCreator.Core.Interfaces;

namespace umContentCreator.Core.EventHandlers;

public class ContentTypeEventsHandler : INotificationHandler<ContentTypeSavingNotification>
{
    private readonly IUmContentCreatorInjectorService _contentCreatorInjectorService;

    public ContentTypeEventsHandler(IUmContentCreatorInjectorService contentCreatorInjectorService)
    {
        _contentCreatorInjectorService = contentCreatorInjectorService;
    }

    public void Handle(ContentTypeSavingNotification notification)
    {
        _contentCreatorInjectorService.AddUmContentCreatorToExistingContentTypes(notification.SavedEntities);
    }
}