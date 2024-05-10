using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using umContentCreator.Core.Interfaces;

namespace umContentCreator.Core.Handles
{
    public class ServerVariablesParsingNotificationHandler : INotificationHandler<ServerVariablesParsingNotification>
    {
        private ISettingsService _settingsService;
        public ServerVariablesParsingNotificationHandler(ISettingsService settingsService)
        {
            _settingsService = settingsService;
        }
        public void Handle(ServerVariablesParsingNotification notification)
        {
            var task = _settingsService.LoadSettingsAsync();
            var settings = task.Result;

            notification.ServerVariables.Add("umContentCreator", new
            {
                ApiKey = settings.ApiKey
            });
        }
    }
}
