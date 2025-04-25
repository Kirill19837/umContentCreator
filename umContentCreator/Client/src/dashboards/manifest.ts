import { ManifestDashboard } from "@umbraco-cms/backoffice/dashboard";

const dashboardsManifest: Array<ManifestDashboard> = [
	{
		type: 'dashboard',
        alias: "umContentCreator.dashboard",
        name: "umContentCreator-dashboard",
        elementName: "um-content-creator-dashboard",
        js: () => import("./umContentCreator-dashboard.ts"),
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
]

export const manifests = [...dashboardsManifest];