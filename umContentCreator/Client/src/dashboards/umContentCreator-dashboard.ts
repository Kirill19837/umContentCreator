import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  html,
  css,
  customElement,
  property,
  LitElement,
  state,
  TemplateResult,
} from "@umbraco-cms/backoffice/external/lit";
import {
  UMB_NOTIFICATION_CONTEXT,
  UmbNotificationColor,
  UmbNotificationContext,
} from "@umbraco-cms/backoffice/notification";
import { getJson, postStatus } from "../utils/api-utils";
import { SettingModel } from "../types";

@customElement("um-content-creator-dashboard")
export default class UmContentCreatorDashboardElement extends UmbElementMixin(
  LitElement
) {
  static styles = css`
    .settings-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .settings h2 {
      margin-bottom: 1.5rem;
      font-size: 30px;
      font-weight: 600;
      color: #333;
      text-align: center;
    }
    uui-button {
      margin-top: 15px;
    }
    .settingsForm {
      display: flex;
      flex-direction: column;
    }
    .configuration-text {
      margin-top: 15px;
    }
  `;

  #notificationContext?: UmbNotificationContext;

  constructor() {
    super();
    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (instance) => {
      this.#notificationContext = instance;
    });
  }

  @property({ type: String }) textApiKey = "";
  @property({ type: String }) textModel = "";
  @property({ type: String }) googleApiKey = "";
  @property({ type: String}) googleSearchRegion = "";
  @property({ type: String}) googleSearchRights = "";
  @property({ type: String }) customSearchEngineKey = "";
  @property({ type: String }) preferredImageModel = "v1";
  @property({ type: String }) stabilityApiKey = "";
  @property({ type: String }) stabilityApiModel = "";
  @property({ type: String }) aspectRatio = "1:1";
  @property({ type: String }) aliases = "";

  @state()
  showTextSectionTab = true;

  @state()
  showImageSectionTab = false;

  @state()
  showConfigurationDataTypes = false;

  connectedCallback() {
    super.connectedCallback();
    this.loadSettings();
  }

  async loadSettings() {
    const loadUrl = "/api/configuration/loadSettings";
    try {
      const result = await getJson<{
        textApiKey: string;
        textModel: string;
        googleApiKey: string;
        googleSearchRegion: string;
        googleSearchRights: string;
        customSearchEngineKey: string;
        stabilityApiKey: string;
        stabilityApiModel: string;
        preferredImageModel: string;
        aspectRatio: string;
      }>(loadUrl);
      this.textApiKey = result.textApiKey || "";
      this.textModel = result.textModel || "";
      this.googleApiKey = result.googleApiKey || "";
      this.googleSearchRegion = result.googleSearchRegion || "";
      this.googleSearchRights = result.googleSearchRights || "";
      this.customSearchEngineKey = result.customSearchEngineKey || "";
      this.stabilityApiKey = result.stabilityApiKey || "";
      this.stabilityApiModel = result.stabilityApiModel || "";
      this.preferredImageModel = result.preferredImageModel || "v1";
      this.aspectRatio = result.aspectRatio || "1:1";
    } catch (error) {
      this.showNotification("Error loading settings", "danger");
    }
  }

  async saveSettings() {
    try {
      await postStatus<SettingModel>("/api/configuration/saveSettings", {
        textApiKey: this.textApiKey,
        textModel: this.textModel,
        googleApiKey: this.googleApiKey,
        customSearchEngineKey: this.customSearchEngineKey,
        googleSearchRegion: this.googleSearchRegion,
        googleSearchRights: this.googleSearchRights,
        stabilityApiKey: this.stabilityApiKey,
        stabilityApiModel: this.stabilityApiModel,
        preferredImageModel: this.preferredImageModel,
        aspectRatio: this.aspectRatio,
      });

      this.showNotification("Settings saved successfully", "positive");
    } catch (error) {
      this.showNotification("Error saving settings", "danger");
    }
  }

  showNotification(message: string, type: UmbNotificationColor) {
    this.#notificationContext?.peek(type, {
      data: {
        message: message,
      },
    });
  }

  async updateAliases() {
    try {
      await postStatus("/api/configurationDocumentType/updateAliases", {
        aliases: this.aliases,
      });
      this.showNotification(
        "Types have been successfully updated.",
        "positive"
      );
    } catch (error) {
      this.showNotification("Error saving types", "danger");
    }
  }

  render() {
    return html`
      <div class="settings">
        <div class="settings-container">
          <h2>umContentCreator Settings</h2>
          <div style="display: flex; justify-content: center">
            <uui-tab-group> ${this._renderTabs()} </uui-tab-group>
          </div>
          <div class="umb-dashboard__content">${this._renderActiveTab()}</div>
        </div>
      </div>
    `;
  }

  private _renderTabs() {
    return html`
      <uui-tab
        label="text-section-tab"
        @click="${() => this.toggleTabs("search")}"
        ?active="${this.showTextSectionTab}"
        id="text-section-tab"
      >
        Text Generate
      </uui-tab>
      <uui-tab
        label="image-section-tab"
        @click="${() => this.toggleTabs("generate")}"
        ?active="${this.showImageSectionTab}"
        id="image-section-tab"
      >
        Image Generate
      </uui-tab>
      <uui-tab
        label="image-section-tab"
        @click="${() => this.toggleTabs("configurationDataTypes")}"
        ?active="${this.showConfigurationDataTypes}"
        id="configuration-datatypes-section-tab"
      >
        Configuration Data Types
      </uui-tab>
    `;
  }

  private _renderActiveTab(): TemplateResult | null {
    if (this.showTextSectionTab) {
      return html`
        <div>
          <div class="settingsForm">
            <uui-label for="apiKey">Enter your API key:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Enter your API key:"
              pristine=""
              .value=${this.textApiKey}
              @input=${(e: Event) =>
                (this.textApiKey = (e.target as HTMLInputElement).value)}
            >
            </uui-input-password>
            <uui-label for="apiKey">Text Model:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Text Model:"
              pristine=""
              .value=${this.textModel}
              @input=${(e: Event) =>
                (this.textModel = (e.target as HTMLInputElement).value)}
            >
            </uui-input-password>
          </div>
          <uui-button
            style="width: 100%; --uui-button-content-align: center;"
            pristine=""
            label="Save"
            look="primary"
            @click=${this.saveSettings}
            .disabled=${!this.textApiKey}
          ></uui-button>
        </div>
      `;
    } else if (this.showImageSectionTab) {
      return html`
        <div>
          <div class="settingsForm">
            <uui-label for="apiKey">Google API key:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Google API key:"
              pristine=""
              .value=${this.googleApiKey}
              @input=${(e: Event) =>
                (this.googleApiKey = (e.target as HTMLInputElement).value)}
            >
            </uui-input-password>
            <uui-label for="apiKey">Custom Search Engine key:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Custom Search Engine key:"
              pristine=""
              .value=${this.customSearchEngineKey}
              @input=${(e: Event) =>
                (this.customSearchEngineKey = (
                  e.target as HTMLInputElement
                ).value)}
            >
            </uui-input-password>
            <uui-label for="apiKey">Google Search Region</uui-label>
            <uui-input
              label="Google Search Region"
             .value=${this.googleSearchRegion}
              @input=${(e: Event) =>
                (this.googleSearchRegion = (e.target as HTMLInputElement).value)}
            >
            </uui-input>
            <uui-label for="apiKey">Google Search Rights</uui-label>
            <uui-input
              label="Google Search Rights"
             .value=${this.googleSearchRights}
              @input=${(e: Event) =>
                (this.googleSearchRights = (e.target as HTMLInputElement).value)}
            >
            </uui-input>
            <uui-label for="apiKey">Stability API key:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Stability API key:"
              pristine=""
              .value=${this.stabilityApiKey}
              @input=${(e: Event) =>
                (this.stabilityApiKey = (e.target as HTMLInputElement).value)}
            >
            </uui-input-password>
             <uui-label id="image-api-version-label">Stability API Version</uui-label>
            <uui-radio-group
              name="imageApiVersion"
              .value=${this.preferredImageModel}
              @change=${(e: Event) =>
                (this.preferredImageModel = (e.target as HTMLInputElement).value as "v1" | "v2")}
              aria-labelledby="image-api-version-label"
            >
              <uui-radio
                value="v1"
                label="Stability v1"
              ></uui-radio>
              <uui-radio 
                value="v2"
                label="Stability v2"
              ></uui-radio>
            </uui-radio-group>
        ${this.preferredImageModel === "v2"
          ? html`
              <uui-label for="stabilityModel">Stability API Model:</uui-label>
              <uui-input
                id="stabilityModel"
                label="Stability API Model"
                .value=${this.stabilityApiModel}
                @input=${(e: Event) =>
                  (this.stabilityApiModel = (e.target as HTMLInputElement).value)}
              ></uui-input>

              <!-- Aspect Ratio Select -->
              <uui-label for="aspectRatio">Aspect Ratio</uui-label>
              <uui-input
                    id="aspectRatio"
                    label="Aspect Ratio"
                    .value=${this.aspectRatio}
                    @input=${(e: Event) =>
                      (this.aspectRatio = (e.target as HTMLInputElement).value)}
                  >
                  </uui-input>
            `
          : null}
          </div>
          <uui-button
            style="width: 100%; --uui-button-content-align: center;"
            pristine=""
            label="Save"
            look="primary"
            @click=${this.saveSettings}
            .disabled=${!this.textApiKey}
          ></uui-button>
        </div>
      `;
    } else if (this.showConfigurationDataTypes) {
      return html`
        <div class="configuration-text">
          <uui-textarea
            pristine=""
            label="Prompt"
            .value=${this.aliases}
            @input=${(e: Event) =>
              (this.aliases = (e.target as HTMLInputElement).value)}
            rows="7"
            auto-height="false"
            placeholder="Enter aliases for document types, separated by commas (e.g., DateType1, DateType2, DateType3, DateType4, CustomDateType1, CustomDateType2, CustomDateType3)"
          >
          </uui-textarea>
        </div>
        <div>
          <uui-button
            pristine=""
            label="Update Aliases"
            style="width: 100%; --uui-button-content-align: center;"
            look="primary"
            @click=${this.updateAliases}
          ></uui-button>
        </div>
      `;
    }
    return null;
  }

  toggleTabs = (tab: string) => {
    switch (tab) {
      case "search":
        this.showImageSectionTab = false;
        this.showTextSectionTab = true;
        this.showConfigurationDataTypes = false;
        break;
      case "generate":
        this.showImageSectionTab = true;
        this.showTextSectionTab = false;
        this.showConfigurationDataTypes = false;
        break;
      case "configurationDataTypes":
        this.showImageSectionTab = false;
        this.showTextSectionTab = false;
        this.showConfigurationDataTypes = true;
    }
  };
}
