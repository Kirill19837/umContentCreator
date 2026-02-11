import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
import { LitElement as v, html as l, css as S, property as s, state as h, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UMB_NOTIFICATION_CONTEXT as m } from "@umbraco-cms/backoffice/notification";
import { g as T, p as c } from "./api-utils-CmgJo3fQ.js";
var A = Object.defineProperty, w = Object.getOwnPropertyDescriptor, y = (t) => {
  throw TypeError(t);
}, a = (t, e, o, n) => {
  for (var r = n > 1 ? void 0 : n ? w(e, o) : e, p = t.length - 1, g; p >= 0; p--)
    (g = t[p]) && (r = (n ? g(e, o, r) : g(r)) || r);
  return n && r && A(e, o, r), r;
}, d = (t, e, o) => e.has(t) || y("Cannot " + o), x = (t, e, o) => (d(t, e, "read from private field"), e.get(t)), K = (t, e, o) => e.has(t) ? y("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, o), $ = (t, e, o, n) => (d(t, e, "write to private field"), e.set(t, o), o), u;
let i = class extends b(
  v
) {
  constructor() {
    super(), K(this, u), this.textApiKey = "", this.textModel = "", this.googleApiKey = "", this.googleSearchRegion = "", this.googleSearchRights = "", this.customSearchEngineKey = "", this.preferredImageModel = "v1", this.stabilityApiKey = "", this.stabilityApiModel = "", this.aspectRatio = "1:1", this.aliases = "", this.showTextSectionTab = !0, this.showImageSectionTab = !1, this.showConfigurationDataTypes = !1, this.toggleTabs = (t) => {
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
      $(this, u, t);
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.loadSettings();
  }
  async loadSettings() {
    const t = "/api/configuration/loadSettings";
    try {
      const e = await T(t);
      this.textApiKey = e.textApiKey || "", this.textModel = e.textModel || "", this.googleApiKey = e.googleApiKey || "", this.googleSearchRegion = e.googleSearchRegion || "", this.googleSearchRights = e.googleSearchRights || "", this.customSearchEngineKey = e.customSearchEngineKey || "", this.stabilityApiKey = e.stabilityApiKey || "", this.stabilityApiModel = e.stabilityApiModel || "", this.preferredImageModel = e.preferredImageModel || "v1", this.aspectRatio = e.aspectRatio || "1:1";
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
        stabilityApiKey: this.stabilityApiKey,
        stabilityApiModel: this.stabilityApiModel,
        preferredImageModel: this.preferredImageModel,
        aspectRatio: this.aspectRatio
      }), this.showNotification("Settings saved successfully", "positive");
    } catch {
      this.showNotification("Error saving settings", "danger");
    }
  }
  showNotification(t, e) {
    var o;
    (o = x(this, u)) == null || o.peek(e, {
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
    return l`
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
    return l`
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
    return this.showTextSectionTab ? l`
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
      ` : this.showImageSectionTab ? l`
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
             <uui-label id="image-api-version-label">Stability API Version</uui-label>
            <uui-radio-group
              name="imageApiVersion"
              .value=${this.preferredImageModel}
              @change=${(t) => this.preferredImageModel = t.target.value}
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
        ${this.preferredImageModel === "v2" ? l`
              <uui-label for="stabilityModel">Stability API Model:</uui-label>
              <uui-input
                id="stabilityModel"
                label="Stability API Model"
                .value=${this.stabilityApiModel}
                @input=${(t) => this.stabilityApiModel = t.target.value}
              ></uui-input>

              <!-- Aspect Ratio Select -->
              <uui-label for="aspectRatio">Aspect Ratio</uui-label>
              <uui-input
                    id="aspectRatio"
                    label="Aspect Ratio"
                    .value=${this.aspectRatio}
                    @input=${(t) => this.aspectRatio = t.target.value}
                  >
                  </uui-input>
            ` : null}
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
      ` : this.showConfigurationDataTypes ? l`
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
u = /* @__PURE__ */ new WeakMap();
i.styles = S`
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
a([
  s({ type: String })
], i.prototype, "textApiKey", 2);
a([
  s({ type: String })
], i.prototype, "textModel", 2);
a([
  s({ type: String })
], i.prototype, "googleApiKey", 2);
a([
  s({ type: String })
], i.prototype, "googleSearchRegion", 2);
a([
  s({ type: String })
], i.prototype, "googleSearchRights", 2);
a([
  s({ type: String })
], i.prototype, "customSearchEngineKey", 2);
a([
  s({ type: String })
], i.prototype, "preferredImageModel", 2);
a([
  s({ type: String })
], i.prototype, "stabilityApiKey", 2);
a([
  s({ type: String })
], i.prototype, "stabilityApiModel", 2);
a([
  s({ type: String })
], i.prototype, "aspectRatio", 2);
a([
  s({ type: String })
], i.prototype, "aliases", 2);
a([
  h()
], i.prototype, "showTextSectionTab", 2);
a([
  h()
], i.prototype, "showImageSectionTab", 2);
a([
  h()
], i.prototype, "showConfigurationDataTypes", 2);
i = a([
  f("um-content-creator-dashboard")
], i);
export {
  i as default
};
//# sourceMappingURL=umContentCreator-dashboard-XzTBy7Cg.js.map
