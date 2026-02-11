import { manifests as dashboardManifests } from './dashboards/manifest.ts';
import { manifests as customPropertiesManifest } from './custom-property/manifest.ts';
import {manifests as modalManifests } from './modal/manifest.ts'
import {manifests as tipTopPluginManifests} from  './tipTapPlugin/manifest.ts'

import { UmbEntryPointOnInit } from "@umbraco-cms/backoffice/extension-api";

export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
	extensionRegistry.registerMany([
		...dashboardManifests,
		...customPropertiesManifest,
		...modalManifests,
		...tipTopPluginManifests
	]);
};