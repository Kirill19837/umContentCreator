import { ManifestPropertyEditorUi } from "@umbraco-cms/backoffice/property-editor";

const customPropertiesManifest: Array<ManifestPropertyEditorUi> = [
  {
    type: "propertyEditorUi",
    alias: "Umb.PropertyEditorUi.OskiTextBox",
    name: "Oski Text Box - Generate Text",
    elementName: "custom-text-box",
    js: () => import("./text-box/custom-text-box.ts"),
    meta: {
      label: "Oski Text Box - Generate Text",
      icon: "icon-edit",
      group: "common",
      propertyEditorSchemaAlias: "Umbraco.TextBox",
    },
  },
  {
    type: "propertyEditorUi",
    alias: "Umb.PropertyEditorUi.OskiMediaPicker",
    name: "OSKI Media Picker - Generate Image",
    js: () => import("./media-picker/custom-mediaPicker.ts"),
    meta: {
      label: "OSKI Media Picker - Generate Image",
      propertyEditorSchemaAlias: "Umbraco.MediaPicker3",
      icon: "icon-picture",
      group: "media",
      supportsReadOnly: true,
      settings: {
        properties: [
          {
            alias: "negativePrompts",
            label: "Negative prompts",
            description:
              'Negative prompts" are queries using negative phrases to exclude unwanted elements or results',
            propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox",
          },
          {
            alias: "numberGenerate",
            label: "Number of images to generate",
            description: "Quantity of images to generate.",
            propertyEditorUiAlias: "Umb.PropertyEditorUi.Integer",
          },
        ],
        defaultData: [
          {
            alias: "negativePrompts",
            value: "labels text diagram words american US sports",
          },
          {
            alias: "numberGenerate",
            value: 1,
          },
        ],
      },
    },
  },
  {
    type: "propertyEditorUi",
    alias: "Umb.PropertyEditorUi.OskiTexArea",
    name: "Oski Text Area - Generate Text",
    elementName: "custom-text-area",
    js: () => import("./text-area/custom-text-area.ts"),
    meta: {
      label: "Oski Text Area - Generate Text",
      icon: "icon-edit",
      group: "common",
      propertyEditorSchemaAlias: "Umbraco.TextArea",
    },
  },
];

export const manifests = [...customPropertiesManifest];
