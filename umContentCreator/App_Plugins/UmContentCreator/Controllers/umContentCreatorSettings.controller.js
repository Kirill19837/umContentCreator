angular.module("umbraco").controller("UmContentCreatorSettingsController",
    function ($scope, $http, notificationsService) {
        const saveUrl = "/Umbraco/Api/Configuration/SaveSettings";
        const loadUrl = "/Umbraco/Api/Configuration/LoadSettings";
        const modelsUrl = "/Umbraco/Api/Configuration/GetAvailableModels";
        $scope.model = {};
        $scope.availableModels = [];
        
        $scope.init = function () {
            $http.get(loadUrl).then(function (response) {
                $scope.model = response.data;
            }).catch(function () {
                notificationsService.error("Error", "Failed to load settings.");
            });

            $http.get(modelsUrl).then(function (response) {
                $scope.availableModels = response.data;
            }).catch(function () {
                notificationsService.error("Error", "Failed to load available models.");
            });
        };

        $scope.save = function () {
            $http.post(saveUrl, $scope.model).then(function () {
                notificationsService.success("Success", "Settings saved successfully.");
            }).catch(function () {
                notificationsService.error("Error", "Failed to save settings.");
            });
        };

        $scope.init();
    });