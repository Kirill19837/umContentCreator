angular.module('umbraco').factory('umImageContentCreatorService',
    function ($http) {
        const defaultConfiguration = {
            generationModel: {
                prompt: '',
                numberOfImages: 1,
                imageSize: 256
            },
            sizeLabels: {
                256: '256 x 256',
                512: '512 x 512',
                1024: '1024 x 1024'
            },
            validSizes: [256, 512, 1024],
            isGenerating: false,
            isAddingMedia: false,
            generatedImages: [],
            generateButtonText: 'Generate',
            selectedImage: null
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
            getGeneratedImages: function (generationModel) {
                return new Promise((resolve, reject) => {
                    if (!isValidData(generationModel)) {
                        return;
                    }

                    configuration.isGenerating = true;
                    configuration.generationModel = generationModel;

                    $http.post("/umbraco/api/UmContentCreator/GetGeneratedImages", generationModel)
                        .then(function (response) {
                            configuration.generatedImages = response.data?.map(function(url) {
                                return { url: url, selected: false };
                            });

                            configuration.isGenerating = false;
                            configuration.generateButtonText = 'Regenerate';
                            
                            resolve(configuration);
                        })
                        .catch(function (error) {
                            configuration.isGenerating = false;
                            reject(error?.data?.detail ?? 'Failed to generate image.');
                        });
                });
            },
            uploadImageFromUrl: function (url, mediaItemName) {
                const data = {
                    url: url,
                    mediaItemName: mediaItemName
                };

                return $http.post('/umbraco/api/UmContentCreator/CreateMediaItemFromUrl', data)
                    .then(response => {
                        return response.data;
                    });
            }
        };
    });
