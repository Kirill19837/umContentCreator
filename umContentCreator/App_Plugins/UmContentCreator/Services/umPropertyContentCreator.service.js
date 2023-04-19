angular.module('umbraco').factory('umPropertyContentCreatorService',
    function ($http, notificationsService) {
        const defaultConfiguration = {
            generationModel: {
                prompt: '',
                maxTokens: 5,
                temperature: 0.6,
                propertyEditorAlias: ''
            },
            temperatureLabels: {
                0.2: 'Conservative',
                0.4: 'Cautious',
                0.6: 'Balanced',
                0.8: 'Creative',
                1.0: 'Adventurous'
            },
            isGenerating: false,
            generatedText: '',
            generateButtonText: 'Generate'
        };

        function isValidData(data) {
            return data && typeof data === 'object' && !Array.isArray(data);
        }

        let configuration;

        return {
            getInitialValues: function () {
                configuration = JSON.parse(JSON.stringify(defaultConfiguration));
                return configuration;
            },
            getGeneratedText: function (generationModel, propertyEditorAlias) {
                if (!isValidData(generationModel)) {
                    return;
                }

                configuration.isGenerating = true;
                generationModel.propertyEditorAlias = propertyEditorAlias;
                configuration.generationModel = generationModel;

                $http.post("/umbraco/api/UmContentCreator/GetGeneratedText", generationModel)
                    .then(function (response) {
                        configuration.generatedText = response.data;
                        configuration.isGenerating = false;
                        configuration.generateButtonText = 'Regenerate';
                    })
                    .catch(function (error) {
                        notificationsService.error('Error', error);
                        configuration.isGenerating = false;
                    });

                return configuration;
            }
        };
    });
