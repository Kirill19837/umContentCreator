import {
  css,
  customElement,
  html,
  LitElement,
  property,
  state,
  TemplateResult,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbModalExtensionElement } from "@umbraco-cms/backoffice/modal";
import type { UmbModalContext } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UUIPaginationElement } from "@umbraco-cms/backoffice/external/uui";
import {
  ConfigurationImageModal,
  CreateMediaItemModel,
  GenerateImageModel,
  ImageGenerateModalValue,
  SearchImageModel,
} from "../../types";
import { postJson } from "../../utils/api-utils";
import {
  UMB_NOTIFICATION_CONTEXT,
  UmbNotificationColor,
  UmbNotificationContext,
} from "@umbraco-cms/backoffice/notification";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

// import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

@customElement("image-generate-modal")
export default class ImageGenerateModalElement
  extends UmbElementMixin(LitElement)
  implements
    UmbModalExtensionElement<ConfigurationImageModal, ImageGenerateModalValue>
{
  @property({ attribute: false })
  modalContext?: UmbModalContext<
    ConfigurationImageModal,
    ImageGenerateModalValue
  >;

  @property({ attribute: false })
  data?: ConfigurationImageModal;

  @property({ type: Boolean })
  isGenerating: boolean = false;

  @property({ type: String })
  searchQuery: string = "";

  @property({ type: Number })
  currentPage = 1;

  @property({ type: Number })
  totalResults = 0;

  @property({ type: String })
  prompt = "";

  @state()
  images: string[] = [];

  @state()
  selectedImage: number = -1;

  @state()
  showSearchTab = true;

  @state()
  showGenerateTab = false;

  #notificationContext?: UmbNotificationContext;

  constructor() {
    super();
    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (instance) => {
      this.#notificationContext = instance;
    });
  }

  private async _searchImage() {
    this.images = [];
    try {
      const result = await postJson<
        SearchImageModel,
        { images: string[]; totalResults: number }
      >("/api/umContentCreator/searchImage", {
        query: this.searchQuery,
        currentPage: this.currentPage,
        pageSize: 10,
      });

      this.images = result.images;
      this.totalResults = result.totalResults;
      this.showNotification("Images found during the search", "positive");
    } catch (error) {
      this.showNotification("Error occurred while searching", "danger");
    }
  }

  private async _saveImage() {
    try {

      const mediaModels = this.modalContext?.data?.value?.map(entry => ({
        key: entry.key,
        mediaKey: entry.mediaKey,
      })) ?? [];

      const result = await postJson<
        CreateMediaItemModel,
        { key: string; mediaKey: string }
      >("/api/umContentCreator/createMediaItemFromUrl", {
        url: this.showSearchTab ? this.images[this.selectedImage] : "",
        base64: this.showGenerateTab ? this.images[this.selectedImage] : "",
        alias: this.modalContext?.data.alias,
        mediaFiles: mediaModels,
      });
      this.modalContext?.updateValue({
        key: result.key,
        mediaKey: result.mediaKey,
      });
      this.modalContext?.submit();
    } catch (error) {
      this.showNotification(
        "Error occurred while generating the media",
        "danger"
      );
    }
  }

  private _handleSearchQuery(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.searchQuery = target.value;
  }

  private _handlePageChange(event: CustomEvent) {
    const target = event.target as UUIPaginationElement;
    this.currentPage = target.current;
    this.images = [];
    this._searchImage();
  }

  private _handlePrompt(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.prompt = target.value;
  }

private async _generateImage() {
  if (this.isGenerating) return;

  this.isGenerating = true;

  try {
    const result = await postJson<GenerateImageModel, string[]>(
      "/api/umContentCreator/getGenerateImage",
      {
        prompt: this.prompt,
        negativePrompts: this.modalContext?.data.negativePrompts,
        numberOfImages: this.modalContext?.data.numberGenerate,
      }
    );

    this.images = result;
    this.showNotification(
      "The image was successfully generated",
      "positive"
    );
  } catch (error) {
    this.showNotification(
      "Generation error while creating media: " + error,
      "danger"
    );
  } finally {
    this.isGenerating = false;
  }
}

  showNotification(message: string, type: UmbNotificationColor) {
    this.#notificationContext?.peek(type, {
      data: {
        message: message,
      },
    });
  }

  private _handleCancel() {
    this.modalContext?.submit();
  }

  render() {
    return html`
         <uui-modal-dialog id="dialogElement">
             <uui-dialog-layout class="layout">
             <span 
             class="close-modal" 
             @click=${this._handleCancel}>
                &times;
             </span>
            <div class="um-modal-title">
             <h3>Find/Create content for <span>${
               this.modalContext?.data.alias
             }</span></h3>
            </div>
                 <div style="display: flex; justify-content: center">
                     <uui-tab-group>
                         ${this._renderTabs()}
                     </uui-tab-group>
                 </div>
                 <div class="umb-dashboard__content">
                     ${this._renderActiveTab()}
                 </div>
             </uui-dialog-layout>
         </uui-modal-dialog>
         `;
  }

  private _renderActiveTab(): TemplateResult | null {
    if (this.showSearchTab) {
      return html`
        <div>
          <p>What would you like to search</p>
          <uui-textarea
            pristine=""
            label="Label"
            rows="5"
            auto-height="false"
            placeholder="Search for images..."
            .value=${this.searchQuery}
            @input=${this._handleSearchQuery}
          ></uui-textarea>
          <div class="images-container">
            ${this.images.map(
              (url, index) =>
                html`
                  <img
                    src=${url}
                    class=${this.selectedImage === index ? "selected" : ""}
                    @click=${() => (this.selectedImage = index)}
                  />
                `
            )}
          </div>
          ${this.totalResults > 1
            ? html`
                <div style="overflow: hidden; padding: 6px;">
                  <uui-pagination
                    total=${this.totalResults}
                    current="1"
                    @change=${this._handlePageChange}
                  ></uui-pagination>
                </div>
              `
            : ""}
          <div class="button-container">
            <uui-button
              pristine=""
              label=${this.images.length === 0 ? "Search" : "Search Again"}
              look="primary"
              ?disabled=${!this.searchQuery}
              @click=${this._searchImage}
            ></uui-button>
            ${this.images.length && this.selectedImage >= 0
              ? html`
                  <uui-button
                    pristine=""
                    label="Save"
                    look="primary"
                    @click=${this._saveImage}
                  ></uui-button>
                `
              : ""}
          </div>
        </div>
      `;
    } else if (this.showGenerateTab) {
      return html`
            <div>
                <p>What would you like to generate</p>
                <uui-textarea 
                pristine="" 
                label="Label" 
                rows="5" 
                placeholder="Enter a prompt..."
                auto-height="false"
                .value=${this.prompt}
                @input=${this._handlePrompt}></uui-textarea></uui-textarea>
                <div class="images-container">
                  ${this.images.map(
                    (image, index) =>
                      html`
                        <img
                          src="data:image/png;base64,${image}"
                          alt="Generated"
                          class=${this.selectedImage === index
                            ? "selected"
                            : ""}
                          @click=${() => (this.selectedImage = index)}
                        />
                      `
                  )}
                    </div>
                <div class="button-container">
                <uui-button 
                pristine="" 
                label=${this.images.length > 0 ? "Regenerate" : "Generate"}
                look="primary"
                state=${this.isGenerating ? "waiting" : undefined}
                ?disabled=${!this.prompt || this.isGenerating}
                @click=${this._generateImage}></uui-button>
                ${
                  this.images.length && this.selectedImage >= 0
                    ? html`
                        <uui-button
                          pristine=""
                          label="Save"
                          look="primary"
                          @click=${this._saveImage}
                        ></uui-button>
                      `
                    : ""
                }
                </div>
            </div>
			`;
    }
    return null;
  }

  private _renderTabs() {
    return html`
      <uui-tab
        label="search-tab"
        @click="${() => this.toggleTabs("search")}"
        ?active="${this.showSearchTab}"
        id="search-tab"
      >
        Search
      </uui-tab>
      <uui-tab
        label="generate-tab"
        @click="${() => this.toggleTabs("generate")}"
        ?active="${this.showGenerateTab}"
        id="generate-tab"
      >
        Generate
      </uui-tab>
    `;
  }

  toggleTabs = (tab: string) => {
    this.images = [];
    switch (tab) {
      case "search":
        this.showGenerateTab = false;
        this.showSearchTab = true;
        break;
      case "generate":
        this.showGenerateTab = true;
        this.showSearchTab = false;
        break;
    }
  };

  static styles = [
    UmbTextStyles,
    css`
      uui-dialog-layout {
        min-width: 400px;
        position: relative;
      }
      .close-modal {
        position: absolute;
        top: 30px;
        right: 30px;
        font-size: 30px;
        cursor: pointer;
      }
      .selected {
        border: 3px solid #1565c0;
      }
      .images-container {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        max-width: 700px;
      }
      .images-container img {
        display: block;
        width: 17%;
        height: auto;
        margin-right: 2%;
        margin-top: 10px;
        margin-bottom: 10px;
      }
      uui-button-group {
        flex-wrap: wrap;
      }
      .button-container {
        margin-top: 10px;
      }
      .um-modal-title span {
        color: #1565c0;
      }
    `,
  ];
}
