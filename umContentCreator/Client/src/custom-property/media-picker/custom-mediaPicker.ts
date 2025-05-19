import {
  css,
  customElement,
  html,
  property,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT } from "@umbraco-cms/backoffice/property";
import type { UmbNumberRangeValueType } from "@umbraco-cms/backoffice/models";
import type {
  UmbPropertyEditorConfigCollection,
  UmbPropertyEditorUiElement,
} from "@umbraco-cms/backoffice/property-editor";
import type { UmbTreeStartNode } from "@umbraco-cms/backoffice/tree";
import {
  UMB_VALIDATION_EMPTY_LOCALIZATION_KEY,
  UmbFormControlMixin,
} from "@umbraco-cms/backoffice/validation";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { IMAGE_GENERATE_MODAL_TOKEN } from "../../modal/image-generate/image-generate-modal.token";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import {
  ConfigurationImageModal,
  UmbCropModel,
  UmbMediaPickerPropertyValueEntry,
  UmbMediaPickerValueModel,
} from "../../types";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";

const elementName = "my-umb-property-editor-ui-media-picker";

const UMB_MEDIA_ENTITY_TYPE = "media";

/**
 * @element umb-property-editor-ui-media-picker
 */
@customElement(elementName)
export class UmbPropertyEditorUIMediaPickerElement
  extends UmbFormControlMixin<
    UmbMediaPickerValueModel | undefined,
    typeof UmbLitElement,
    undefined
  >(UmbLitElement)
  implements UmbPropertyEditorUiElement
{
  public set config(config: UmbPropertyEditorConfigCollection | undefined) {
    if (!config) return;

    this._allowedMediaTypes =
      config.getValueByAlias<string>("filter")?.split(",") ?? [];
    this._focalPointEnabled = Boolean(
      config.getValueByAlias("enableLocalFocalPoint")
    );
    this._multiple = Boolean(config.getValueByAlias("multiple"));
    this._preselectedCrops =
      config?.getValueByAlias<Array<UmbCropModel>>("crops") ?? [];

    const startNodeId = config.getValueByAlias<string>("startNodeId") ?? "";
    this._startNode = startNodeId
      ? { unique: startNodeId, entityType: UMB_MEDIA_ENTITY_TYPE }
      : undefined;

    const minMax =
      config.getValueByAlias<UmbNumberRangeValueType>("validationLimit");
    this._min = minMax?.min ?? 0;
    this._max = minMax?.max ?? Infinity;

    this._negativePrompts = config.getValueByAlias("negativePrompts");
    this._numberGenerate = Number(config.getValueByAlias("numberGenerate"));
  }

  /**
   * Sets the input to mandatory, meaning validation will fail if the value is empty.
   * @type {boolean}
   */
  @property({ type: Boolean })
  mandatory?: boolean;

  @property({ type: String })
  mandatoryMessage = UMB_VALIDATION_EMPTY_LOCALIZATION_KEY;

  #modalManagerContext?: typeof UMB_MODAL_MANAGER_CONTEXT.TYPE;

  /**
   * Sets the input to readonly mode, meaning value cannot be changed but still able to read and select its content.
   * @type {boolean}
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  @property({ type: Object })
  configurationModal: ConfigurationImageModal = {
    alias: "",
    value: [],
    pageId: "",
    negativePrompts: "",
    numberGenerate: 1,
  };

  @property({ type: String })
  public negativePrompts = "";

  @property({ type: Number })
  public numberImagesGenerate = 1;

  @state()
  private _startNode?: UmbTreeStartNode;

  @state()
  private _focalPointEnabled: boolean = false;

  @state()
  private _preselectedCrops: Array<UmbCropModel> = [];

  @state()
  private _allowedMediaTypes: Array<string> = [];

  @state()
  private _multiple: boolean = false;

  @state()
  private _min: number = 0;

  @state()
  private _max: number = Infinity;

  @state()
  private _alias?: string;

  @state()
  private _variantId?: string;

  @state()
  private _negativePrompts?: string;

  @state()
  private _numberGenerate?: number;

  constructor() {
    super();

    this.consumeContext(UMB_PROPERTY_CONTEXT, (instance) => {
      this.observe(instance.alias, (alias) => (this._alias = alias));
      this.observe(
        instance.variantId,
        (variantId) => (this._variantId = variantId?.toString() || "invariant")
      );
      this.configurationModal.alias = instance.getAlias();
      this.configurationModal.value = instance.getValue();
    });

    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (instance) => {
      const pageId = instance.getUnique();
      localStorage.setItem('configurationModal_pageId', pageId as string);
    });

    this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (instance) => {
      this.#modalManagerContext = instance;
    });
  }

  private _openModal() {
    this.configurationModal.pageId = localStorage.getItem('configurationModal_pageId');
    let modalContenxt = this.#modalManagerContext?.open(
      this,
      IMAGE_GENERATE_MODAL_TOKEN,
      {
        data: {
          alias: this.configurationModal.alias,
          value: this.configurationModal.value,
          pageId: this.configurationModal.pageId,
          negativePrompts: this._negativePrompts,
          numberGenerate: this._numberGenerate,
        },
      }
    );

    modalContenxt?.onSubmit().then((val) => {
      const mediaItem: UmbMediaPickerPropertyValueEntry = {
        key: val.key,
        mediaKey: val.mediaKey,
        focalPoint: null,
        mediaTypeAlias: "Image",
        crops: [],
      };

      if (this._multiple) {
        this.value = [...(this.value ?? []), mediaItem];
      } else {
        this.value = [mediaItem];
      }
      this.dispatchEvent(new UmbChangeEvent());
    });
  }

  override firstUpdated() {
    this.addFormControlElement(
      this.shadowRoot!.querySelector("umb-input-rich-media")!
    );
  }

  override focus() {
    // return this.shadowRoot?.querySelector<UmbInputRichMediaElement>('umb-input-rich-media')?.focus();
  }

  #onChange(event: CustomEvent & { target: any }) {
    const isEmpty = event.target.value?.length === 0;
    this.value = isEmpty ? undefined : event.target.value;
    this.dispatchEvent(new UmbChangeEvent());
  }

  override render() {
    return html`
      <umb-input-rich-media
        .alias=${this._alias}
        .allowedContentTypeIds=${this._allowedMediaTypes}
        .focalPointEnabled=${this._focalPointEnabled}
        .value=${this.value ?? []}
        .max=${this._max}
        .min=${this._min}
        .preselectedCrops=${this._preselectedCrops}
        .startNode=${this._startNode}
        .variantId=${this._variantId}
        .required=${this.mandatory}
        .requiredMessage=${this.mandatoryMessage}
        ?multiple=${this._multiple}
        @change=${this.#onChange}
        ?readonly=${this.readonly}
      >
      </umb-input-rich-media>
      <div id="wrapper">
        <button
          @click=${this._openModal}
          id="openModalButton"
          class="create-image__open-modal"
          title="Create Image"
        >
          <uui-icon name="icon-image-up"></uui-icon>
        </button>
      </div>
    `;
  }

  static override readonly styles = [
    UmbTextStyles,
    css`
      .create-image__open-modal {
        font-weight: bold;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        padding: 6px 14px;
        translition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
        margin-top: 10px;
      }
      .create-image__open-modal:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      }
      .create-image__open-modal img {
        max-width: 20px;
        height: 20px;
      }
    `,
  ];
}

export { UmbPropertyEditorUIMediaPickerElement as element };

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: UmbPropertyEditorUIMediaPickerElement;
  }
}
