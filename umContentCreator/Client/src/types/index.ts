import { UmbEntityUnique } from "@umbraco-cms/backoffice/entity";

export type UmbRichMediaCardModel = {
  unique: string;
  media: string;
  name: string;
  src?: string;
  icon?: string;
  isTrashed?: boolean;
};

export type UmbCropModel = {
  label?: string;
  alias: string;
  height: number;
  width: number;
  coordinates?: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  };
};

export type UmbMediaPickerPropertyValueEntry = {
  key: string;
  mediaKey: string;
  mediaTypeAlias: string;
  focalPoint: UmbFocalPointModel | null;
  crops: Array<UmbCropModel>;
};

export type UmbFocalPointModel = {
  left: number;
  top: number;
};

export type UmbMediaPickerValueModel = Array<UmbMediaPickerPropertyValueEntry>;

export type ConfigurationImageModal = {
  alias: string | undefined;
  value: Array<UmbMediaPickerPropertyValueEntry>;
  pageId: UmbEntityUnique | undefined;
  numberGenerate: number | undefined;
  negativePrompts: string | undefined;
};

export type ImageGenerateModalValue = {
  key: string;
  mediaKey: string;
};

export type SearchImageModel = {
  query: string;
  currentPage: number;
  pageSize: number;
};

export type CreateMediaItemModel = {
  url: string | null;
  base64: string | null;
  mediaFiles: ImageGenerateModalValue[] | undefined;
  alias: string | undefined;
};

export type GenerateImageModel = {
  prompt: string;
  numberOfImages: number | undefined;
  negativePrompts: string | undefined;
};

export type GenerateTextModel = {
  prompt: string;
  maxTokens: number;
  temperature: number;
  propertyEditorAlias?: string;
};

export type SettingModel = {
  textApiKey: string;
  textModel: string;
  googleApiKey: string;
  customSearchEngineKey: string;
  googleSearchRegion: string;
  googleSearchRights: string;
  stabilityApiKey: string;
};

export type TextGenerateModalData = {
  alias: string | undefined;
  value: string;
  dataTypeAlias: string;
};

export type TextGenerateModalValue = {
  value: string;
};

export type ConfigurationTextGenerateModal = {
  caption: string | undefined;
  value: string;
};
