import { ManifestModal } from "@umbraco-cms/backoffice/modal";

const modalManifests: Array<ManifestModal> = [
    {
        type: "modal",
        alias: "Text.Generate.Modal",
        name: "Text Generate Modal",
        element: () => import("./text-generate/TextGenerateModalElement")
    },
    {
        type: "modal",
        alias: "Image.Generate.Modal",
        name: "Image Generate Modal",
        element: () => import("./image-generate/ImageGenerateModalElement")
    }
]

export const manifests = [...modalManifests];