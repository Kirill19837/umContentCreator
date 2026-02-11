import {
  LitElement,
  html,
  customElement,
  property,
  css,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import type { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { TEXT_GENERATE_MODAL_TOKEN } from "../../modal/text-generate/text-generate-modal.token";
import { UMB_PROPERTY_CONTEXT } from "@umbraco-cms/backoffice/property";
import { ConfigurationTextGenerateModal } from "../../types";

@customElement("custom-text-box")
export default class CustomTextBoxPropertyEditorUIElement
  extends UmbElementMixin(LitElement)
  implements UmbPropertyEditorUiElement
{
  #modalManagerContext?: typeof UMB_MODAL_MANAGER_CONTEXT.TYPE;
  @property({ type: Object })
  configurationModal: ConfigurationTextGenerateModal = {
    caption: "",
    value: "",
  };

  @property({ type: String })
  public value = "";

  #onInput(e: InputEvent) {
    this.value = (e.target as HTMLInputElement).value;
    this.#dispatchChangeEvent();
  }

  #dispatchChangeEvent() {
    this.dispatchEvent(new UmbChangeEvent());
  }

  private _openModal() {
    let modalContenxt = this.#modalManagerContext?.open(
      this,
      TEXT_GENERATE_MODAL_TOKEN,
      {
        data: {
          alias: this.configurationModal.caption,
          value: this.configurationModal.value,
          dataTypeAlias: "",
        },
      }
    );

    modalContenxt?.onSubmit().then((val) => {
      this.value = val.value;
      this.#dispatchChangeEvent();
    });
  }

  constructor() {
    super();
    this.consumeContext(UMB_PROPERTY_CONTEXT, (instance) => {
      this.configurationModal.caption = instance?.getAlias();
      this.configurationModal.value = instance?.getValue();
    });
    this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (instance) => {
      this.#modalManagerContext = instance;
    });
  }

  override render() {
    return html`
      <uui-input
        id="suggestion-input"
        class="element"
        label="text input"
        .value=${this.value || ""}
        @input=${this.#onInput}
      >
      </uui-input>
      <div id="wrapper">
        <button
          @click=${this._openModal}
          id="openModalButton"
          class="text_generate__open-modal"
          title="Create text using AI"
        >
          <uui-icon name="icon-chat"></uui-icon>
        </button>
      </div>
    `;
  }

  static override readonly styles = [
    UmbTextStyles,
    css`
      #wrapper {
        margin-top: 10px;
        display: flex;
        gap: 10px;
      }
      .element {
        width: 100%;
      }
      .text_generate__open-modal {
        font-weight: bold;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        padding: 6px 14px;
        translition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
      }
      .text_generate__open-modal:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      }
      .text_generate__open-modal img {
        max-width: 20px;
        height: 20px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "custom-text-box": CustomTextBoxPropertyEditorUIElement;
  }
}
