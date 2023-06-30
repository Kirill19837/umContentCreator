# umContentCreator

umContentCreator is a package for Umbraco that enhances your content editing experience by integrating AI-powered content generation for text and image properties.
It allows users to generate content using the Chat GPT API for text and the DALL-E API for image generation, providing a seamless and user-friendly interface for managing AI-generated text and images.

## Features
* Adds a content generation button next to each text and image property in the Umbraco CMS
* Configuration tab in the Content section for setting API tokens
* Customizable content generation options, including max words per response and model behavior for text properties
* Image generation based on user-defined keywords or phrases using DALL-E API
* Ability to modify generated text before applying to the property
* Append or replace content in text properties with generated content

## Installation

Follow these steps to install umContentCreator:

1) Download the package from NuGet
2) Install the package in your Umbraco project
3) Configure the Chat GPT API token in the "umContentCreator" configuration tab in the Content section
4) Start generating content for your text and image properties

## Usage

### Text properties
1) Navigate to any content page with text properties in the Umbraco CMS
2) Click on the content generation button next to the desired text property
3) A modal window will open, allowing you to customize the content generation options
4) Enter a prompt and generate text using the Chat GPT API
5) Modify the generated text as needed
6) If the property has existing content, you can choose to append the generated content. If not, click the "Replace" button to replace the content with the generated text

### Image properties
1) Navigate to any content page with image properties in the Umbraco CMS
2) Click on the image generation button next to the desired image property
3) A modal window will open, allowing you to enter a keyword or phrase for the image generation
4) Generate an image using the DALL-E
5) Apply the generated image to the property

## Support
For any issues or questions, please open a GitHub issue or contact the package author.