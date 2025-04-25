import { ManifestTinyMcePlugin } from "@umbraco-cms/backoffice/tiny-mce";

const tinyMcePluginManifests: Array<ManifestTinyMcePlugin> = [
    {
        type: 'tinyMcePlugin',
        alias: "myrteplugin",
        name: "My TinyMCE Plugin",
        js: () => import("./rte-generate-text.ts"),
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
];

export const manifests = [...tinyMcePluginManifests];