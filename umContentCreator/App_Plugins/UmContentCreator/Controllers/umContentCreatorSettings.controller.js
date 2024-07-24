angular.module("umbraco").controller("UmContentCreatorSettingsController",
    function ($scope, $http, $timeout, notificationsService) {
        const saveUrl = "/Umbraco/Api/Configuration/SaveSettings";
        const loadUrl = "/Umbraco/Api/Configuration/LoadSettings";
        $scope.model = {
            apiKey: '',
            textModel: ''
        };

        $scope.init = function () {
            $http.get(loadUrl).then(function (response) {
                $scope.model = response.data;
            }).catch(function () {
                notificationsService.error("Error", "Failed to load settings.");
            });
        };

        $scope.save = function () {
            $http.post(saveUrl, $scope.model).then(function () {
                notificationsService.success("Success", "Settings saved successfully.");
                const mainFormController = angular.element('form[name=settingsForm]').controller('form');

                $timeout(() => {
                    mainFormController.$setPristine();
                });
            }).catch(function () {
                notificationsService.error("Error", "Failed to save settings.");
            });
        };

        $scope.init();
    });