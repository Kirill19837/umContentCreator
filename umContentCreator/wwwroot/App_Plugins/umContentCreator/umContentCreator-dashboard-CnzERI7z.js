import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
import { LitElement as v, html as u, css as S, property as o, state as h, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UMB_NOTIFICATION_CONTEXT as m } from "@umbraco-cms/backoffice/notification";
import { g as T, p as c } from "./api-utils-CmgJo3fQ.js";
var w = Object.defineProperty, x = Object.getOwnPropertyDescriptor, y = (t) => {
  throw TypeError(t);
}, s = (t, e, i, r) => {
  for (var n = r > 1 ? void 0 : r ? x(e, i) : e, p = t.length - 1, g; p >= 0; p--)
    (g = t[p]) && (n = (r ? g(e, i, n) : g(n)) || n);
  return r && n && w(e, i, n), n;
}, d = (t, e, i) => e.has(t) || y("Cannot " + i), K = (t, e, i) => (d(t, e, "read from private field"), e.get(t)), A = (t, e, i) => e.has(t) ? y("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), $ = (t, e, i, r) => (d(t, e, "write to private field"), e.set(t, i), i), l;
let a = class extends b(
  v
) {
  constructor() {
    super(), A(this, l), this.textApiKey = "", this.textModel = "", this.googleApiKey = "", this.googleSearchRegion = "", this.googleSearchRights = "", this.customSearchEngineKey = "", this.stabilityApiKey = "", this.aliases = "", this.showTextSectionTab = !0, this.showImageSectionTab = !1, this.showConfigurationDataTypes = !1, this.toggleTabs = (t) => {
      switch (t) {
        case "search":
          this.showImageSectionTab = !1, this.showTextSectionTab = !0, this.showConfigurationDataTypes = !1;
          break;
        case "generate":
          this.showImageSectionTab = !0, this.showTextSectionTab = !1, this.showConfigurationDataTypes = !1;
          break;
        case "configurationDataTypes":
          this.showImageSectionTab = !1, this.showTextSectionTab = !1, this.showConfigurationDataTypes = !0;
      }
    }, this.consumeContext(m, (t) => {
      $(this, l, t);
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.loadSettings();
  }
  async loadSettings() {
    const t = "/api/configuration/loadSettings";
    try {
      const e = await T(t);
      this.textApiKey = e.textApiKey || "", this.textModel = e.textModel || "", this.googleApiKey = e.googleApiKey || "", this.googleSearchRegion = e.googleSearchRegion || "", this.googleSearchRights = e.googleSearchRights || "", this.customSearchEngineKey = e.customSearchEngineKey || "", this.stabilityApiKey = e.stabilityApiKey || "";
    } catch {
      this.showNotification("Error loading settings", "danger");
    }
  }
  async saveSettings() {
    try {
      await c("/api/configuration/saveSettings", {
        textApiKey: this.textApiKey,
        textModel: this.textModel,
        googleApiKey: this.googleApiKey,
        customSearchEngineKey: this.customSearchEngineKey,
        googleSearchRegion: this.googleSearchRegion,
        googleSearchRights: this.googleSearchRights,
        stabilityApiKey: this.stabilityApiKey
      }), this.showNotification("Settings saved successfully", "positive");
    } catch {
      this.showNotification("Error saving settings", "danger");
    }
  }
  showNotification(t, e) {
    var i;
    (i = K(this, l)) == null || i.peek(e, {
      data: {
        message: t
      }
    });
  }
  async updateAliases() {
    try {
      await c("/api/configurationDocumentType/updateAliases", {
        aliases: this.aliases
      }), this.showNotification(
        "Types have been successfully updated.",
        "positive"
      );
    } catch {
      this.showNotification("Error saving types", "danger");
    }
  }
  render() {
    return u`
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
  _renderTabs() {
    return u`
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
  _renderActiveTab() {
    return this.showTextSectionTab ? u`
        <div>
          <div class="settingsForm">
            <uui-label for="apiKey">Enter your API key:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Enter your API key:"
              pristine=""
              .value=${this.textApiKey}
              @input=${(t) => this.textApiKey = t.target.value}
            >
            </uui-input-password>
            <uui-label for="apiKey">Text Model:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Text Model:"
              pristine=""
              .value=${this.textModel}
              @input=${(t) => this.textModel = t.target.value}
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
      ` : this.showImageSectionTab ? u`
        <div>
          <div class="settingsForm">
            <uui-label for="apiKey">Google API key:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Google API key:"
              pristine=""
              .value=${this.googleApiKey}
              @input=${(t) => this.googleApiKey = t.target.value}
            >
            </uui-input-password>
            <uui-label for="apiKey">Custom Search Engine key:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Custom Search Engine key:"
              pristine=""
              .value=${this.customSearchEngineKey}
              @input=${(t) => this.customSearchEngineKey = t.target.value}
            >
            </uui-input-password>
            <uui-label for="apiKey">Google Search Region</uui-label>
            <uui-input
              label="Google Search Region"
             .value=${this.googleSearchRegion}
              @input=${(t) => this.googleSearchRegion = t.target.value}
            >
            </uui-input>
            <uui-label for="apiKey">Google Search Rights</uui-label>
            <uui-input
              label="Google Search Rights"
             .value=${this.googleSearchRights}
              @input=${(t) => this.googleSearchRights = t.target.value}
            >
            </uui-input>
            <uui-label for="apiKey">Stability API key:</uui-label>
            <uui-input-password
              id="apiKey"
              label="Stability API key:"
              pristine=""
              .value=${this.stabilityApiKey}
              @input=${(t) => this.stabilityApiKey = t.target.value}
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
      ` : this.showConfigurationDataTypes ? u`
        <div class="configuration-text">
          <uui-textarea
            pristine=""
            label="Prompt"
            .value=${this.aliases}
            @input=${(t) => this.aliases = t.target.value}
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
      ` : null;
  }
};
l = /* @__PURE__ */ new WeakMap();
a.styles = S`
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
s([
  o({ type: String })
], a.prototype, "textApiKey", 2);
s([
  o({ type: String })
], a.prototype, "textModel", 2);
s([
  o({ type: String })
], a.prototype, "googleApiKey", 2);
s([
  o({ type: String })
], a.prototype, "googleSearchRegion", 2);
s([
  o({ type: String })
], a.prototype, "googleSearchRights", 2);
s([
  o({ type: String })
], a.prototype, "customSearchEngineKey", 2);
s([
  o({ type: String })
], a.prototype, "stabilityApiKey", 2);
s([
  o({ type: String })
], a.prototype, "aliases", 2);
s([
  h()
], a.prototype, "showTextSectionTab", 2);
s([
  h()
], a.prototype, "showImageSectionTab", 2);
s([
  h()
], a.prototype, "showConfigurationDataTypes", 2);
a = s([
  f("um-content-creator-dashboard")
], a);
export {
  a as default
};
//# sourceMappingURL=umContentCreator-dashboard-CnzERI7z.js.map
