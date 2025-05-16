const t = [
  {
    type: "dashboard",
    alias: "umContentCreator.dashboard",
    name: "umContentCreator-dashboard",
    elementName: "um-content-creator-dashboard",
    js: () => import("./umContentCreator-dashboard-CnzERI7z.js"),
    weight: 30,
    meta: {
      label: "umContentCreator",
      pathname: "umContentCreator-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        // @ts-ignore
        match: "Umb.Section.Content"
      }
    ]
  }
], a = [...t], r = [
  {
    type: "propertyEditorUi",
    alias: "Umb.PropertyEditorUi.OskiTextBox",
    name: "Oski Text Box - Generate Text",
    elementName: "custom-text-box",
    js: () => import("./custom-text-box-DR4CbSD6.js"),
    meta: {
      label: "Oski Text Box - Generate Text",
      icon: "icon-edit",
      group: "common",
      propertyEditorSchemaAlias: "Umbraco.TextBox"
    }
  },
  {
    type: "propertyEditorUi",
    alias: "Umb.PropertyEditorUi.OskiMediaPicker",
    name: "OSKI Media Picker - Generate Image",
    js: () => import("./custom-mediaPicker-C2N0l5N0.js"),
    meta: {
      label: "OSKI Media Picker - Generate Image",
      propertyEditorSchemaAlias: "Umbraco.MediaPicker3",
      icon: "icon-picture",
      group: "media",
      supportsReadOnly: !0,
      settings: {
        properties: [
          {
            alias: "negativePrompts",
            label: "Negative prompts",
            description: 'Negative prompts" are queries using negative phrases to exclude unwanted elements or results',
            propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
          },
          {
            alias: "numberGenerate",
            label: "Number of images to generate",
            description: "Quantity of images to generate.",
            propertyEditorUiAlias: "Umb.PropertyEditorUi.Integer"
          }
        ],
        defaultData: [
          {
            alias: "negativePrompts",
            value: "labels text diagram words american US sports"
          },
          {
            alias: "numberGenerate",
            value: 1
          }
        ]
      }
    }
  },
  {
    type: "propertyEditorUi",
    alias: "Umb.PropertyEditorUi.OskiTexArea",
    name: "Oski Text Area - Generate Text",
    elementName: "custom-text-area",
    js: () => import("./custom-text-area-DsYCSMOr.js"),
    meta: {
      label: "Oski Text Area - Generate Text",
      icon: "icon-edit",
      group: "common",
      propertyEditorSchemaAlias: "Umbraco.TextArea"
    }
  }
], o = [...r], i = [
  {
    type: "modal",
    alias: "Text.Generate.Modal",
    name: "Text Generate Modal",
    element: () => import("./TextGenerateModalElement-Cfh_vcfT.js")
  },
  {
    type: "modal",
    alias: "Image.Generate.Modal",
    name: "Image Generate Modal",
    element: () => import("./ImageGenerateModalElement-CQL-BGQ1.js")
  }
], n = [...i], s = [
  {
    type: "tinyMcePlugin",
    alias: "myrteplugin",
    name: "My TinyMCE Plugin",
    js: () => import("./rte-generate-text-CIxNAw8V.js"),
    meta: {
      toolbar: [
        {
          alias: "generateTextButton",
          label: "Generate Text RTE",
          icon: "code-sample"
        }
      ]
    }
  }
], m = [...s], p = (l, e) => {
  e.registerMany([
    ...a,
    ...o,
    ...n,
    ...m
  ]);
};
export {
  p as onInit
};
//# sourceMappingURL=umContentCreator.js.map
