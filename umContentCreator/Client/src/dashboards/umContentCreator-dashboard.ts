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
  @property({ type: String }) customSearchEngineKey = "";
  @property({ type: String }) stabilityApiKey = "";
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
        customSearchEngineKey: string;
        stabilityApiKey: string;
      }>(loadUrl);
      this.textApiKey = result.textApiKey || "";
      this.textModel = result.textModel || "";
      this.googleApiKey = result.googleApiKey || "";
      this.customSearchEngineKey = result.customSearchEngineKey || "";
      this.stabilityApiKey = result.stabilityApiKey || "";
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
        stabilityApiKey: this.stabilityApiKey,
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
