angular.module("umbraco").controller("UmContentCreatorSettingsController",
    function ($scope, $http, notificationsService) {
        const saveUrl = "/Umbraco/Api/Configuration/SaveSettings";
        const loadUrl = "/Umbraco/Api/Configuration/LoadSettings";
        $scope.model = {
            apiKey: ''
        };

        $scope.passwordInputType = 'password';
        $scope.passwordButtonLabel = 'Show';

        $scope.togglePasswordVisibility = function () {
            if ($scope.passwordInputType === 'password') {
                $scope.passwordInputType = 'text';
                $scope.passwordButtonLabel = 'Hide';
            } else {
                $scope.passwordInputType = 'password';
                $scope.passwordButtonLabel = 'Show';
            }
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
            }).catch(function () {
                notificationsService.error("Error", "Failed to save settings.");
            });
        };

        $scope.init();
    });