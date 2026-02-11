import { ManifestTiptapToolbarExtension } from "@umbraco-cms/backoffice/tiptap";

const tipTopPluginManifests: Array<ManifestTiptapToolbarExtension> = [
  {
    type: "tiptapToolbarExtension",
    kind: "button",
    alias: "Tiptap.Toolbar.MyTiptapPlugin",
    name: "My Tiptap Plugin",
    js: () => import("./rte-generate-text.ts"),
    meta: {
      alias: "generateTextButton",
      label: "Generate Text RTE",
      icon: "icon-binarycode",
    },
  },
];

export const manifests = [...tipTopPluginManifests];
