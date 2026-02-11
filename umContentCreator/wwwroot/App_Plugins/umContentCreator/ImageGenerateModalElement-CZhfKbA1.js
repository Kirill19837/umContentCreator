import { LitElement as v, html as o, css as f, property as l, state as p, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as _ } from "@umbraco-cms/backoffice/style";
import { a as g } from "./api-utils-CmgJo3fQ.js";
import { UMB_NOTIFICATION_CONTEXT as x } from "@umbraco-cms/backoffice/notification";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
var C = Object.defineProperty, T = Object.getOwnPropertyDescriptor, b = (e) => {
  throw TypeError(e);
}, s = (e, t, a, n) => {
  for (var r = n > 1 ? void 0 : n ? T(t, a) : t, h = e.length - 1, u; h >= 0; h--)
    (u = e[h]) && (r = (n ? u(t, a, r) : u(r)) || r);
  return n && r && C(t, a, r), r;
}, y = (e, t, a) => t.has(e) || b("Cannot " + a), I = (e, t, a) => (y(e, t, "read from private field"), t.get(e)), G = (e, t, a) => t.has(e) ? b("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), k = (e, t, a, n) => (y(e, t, "write to private field"), t.set(e, a), a), c;
let i = class extends $(v) {
  constructor() {
    super(), this.isGenerating = !1, this.searchQuery = "", this.currentPage = 1, this.totalResults = 0, this.prompt = "", this.images = [], this.selectedImage = -1, this.showSearchTab = !0, this.showGenerateTab = !1, G(this, c), this.toggleTabs = (e) => {
      switch (this.images = [], e) {
        case "search":
          this.showGenerateTab = !1, this.showSearchTab = !0;
          break;
        case "generate":
          this.showGenerateTab = !0, this.showSearchTab = !1;
          break;
      }
    }, this.consumeContext(x, (e) => {
      k(this, c, e);
    });
  }
  async _searchImage() {
    this.images = [];
    try {
      const e = await g("/api/umContentCreator/searchImage", {
        query: this.searchQuery,
        currentPage: this.currentPage,
        pageSize: 10
      });
      this.images = e.images, this.totalResults = e.totalResults, this.showNotification("Images found during the search", "positive");
    } catch {
      this.showNotification("Error occurred while searching", "danger");
    }
  }
  async _saveImage() {
    var e, t, a, n, r, h;
    try {
      const u = ((a = (t = (e = this.modalContext) == null ? void 0 : e.data) == null ? void 0 : t.value) == null ? void 0 : a.map((m) => ({
        key: m.key,
        mediaKey: m.mediaKey
      }))) ?? [], d = await g("/api/umContentCreator/createMediaItemFromUrl", {
        url: this.showSearchTab ? this.images[this.selectedImage] : "",
        base64: this.showGenerateTab ? this.images[this.selectedImage] : "",
        alias: (n = this.modalContext) == null ? void 0 : n.data.alias,
        mediaFiles: u
      });
      (r = this.modalContext) == null || r.updateValue({
        key: d.key,
        mediaKey: d.mediaKey
      }), (h = this.modalContext) == null || h.submit();
    } catch {
      this.showNotification(
        "Error occurred while generating the media",
        "danger"
      );
    }
  }
  _handleSearchQuery(e) {
    const t = e.target;
    this.searchQuery = t.value;
  }
  _handlePageChange(e) {
    const t = e.target;
    this.currentPage = t.current, this.images = [], this._searchImage();
  }
  _handlePrompt(e) {
    const t = e.target;
    this.prompt = t.value;
  }
  async _generateImage() {
    var e, t;
    if (!this.isGenerating) {
      this.isGenerating = !0;
      try {
        const a = await g(
          "/api/umContentCreator/getGenerateImage",
          {
            prompt: this.prompt,
            negativePrompts: (e = this.modalContext) == null ? void 0 : e.data.negativePrompts,
            numberOfImages: (t = this.modalContext) == null ? void 0 : t.data.numberGenerate
          }
        );
        this.images = a, this.showNotification(
          "The image was successfully generated",
          "positive"
        );
      } catch (a) {
        this.showNotification(
          "Generation error while creating media: " + a,
          "danger"
        );
      } finally {
        this.isGenerating = !1;
      }
    }
  }
  showNotification(e, t) {
    var a;
    (a = I(this, c)) == null || a.peek(t, {
      data: {
        message: e
      }
    });
  }
  _handleCancel() {
    var e;
    (e = this.modalContext) == null || e.submit();
  }
  render() {
    var e;
    return o`
         <uui-modal-dialog id="dialogElement">
             <uui-dialog-layout class="layout">
             <span 
             class="close-modal" 
             @click=${this._handleCancel}>
                &times;
             </span>
            <div class="um-modal-title">
             <h3>Find/Create content for <span>${(e = this.modalContext) == null ? void 0 : e.data.alias}</span></h3>
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
  _renderActiveTab() {
    return this.showSearchTab ? o`
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
      (e, t) => o`
                  <img
                    src=${e}
                    class=${this.selectedImage === t ? "selected" : ""}
                    @click=${() => this.selectedImage = t}
                  />
                `
    )}
          </div>
          ${this.totalResults > 1 ? o`
                <div style="overflow: hidden; padding: 6px;">
                  <uui-pagination
                    total=${this.totalResults}
                    current="1"
                    @change=${this._handlePageChange}
                  ></uui-pagination>
                </div>
              ` : ""}
          <div class="button-container">
            <uui-button
              pristine=""
              label=${this.images.length === 0 ? "Search" : "Search Again"}
              look="primary"
              ?disabled=${!this.searchQuery}
              @click=${this._searchImage}
            ></uui-button>
            ${this.images.length && this.selectedImage >= 0 ? o`
                  <uui-button
                    pristine=""
                    label="Save"
                    look="primary"
                    @click=${this._saveImage}
                  ></uui-button>
                ` : ""}
          </div>
        </div>
      ` : this.showGenerateTab ? o`
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
      (e, t) => o`
                        <img
                          src="data:image/png;base64,${e}"
                          alt="Generated"
                          class=${this.selectedImage === t ? "selected" : ""}
                          @click=${() => this.selectedImage = t}
                        />
                      `
    )}
                    </div>
                <div class="button-container">
                <uui-button 
                pristine="" 
                label=${this.images.length > 0 ? "Regenerate" : "Generate"}
                look="primary"
                state=${this.isGenerating ? "waiting" : void 0}
                ?disabled=${!this.prompt || this.isGenerating}
                @click=${this._generateImage}></uui-button>
                ${this.images.length && this.selectedImage >= 0 ? o`
                        <uui-button
                          pristine=""
                          label="Save"
                          look="primary"
                          @click=${this._saveImage}
                        ></uui-button>
                      ` : ""}
                </div>
            </div>
			` : null;
  }
  _renderTabs() {
    return o`
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
};
c = /* @__PURE__ */ new WeakMap();
i.styles = [
  _,
  f`
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
    `
];
s([
  l({ attribute: !1 })
], i.prototype, "modalContext", 2);
s([
  l({ attribute: !1 })
], i.prototype, "data", 2);
s([
  l({ type: Boolean })
], i.prototype, "isGenerating", 2);
s([
  l({ type: String })
], i.prototype, "searchQuery", 2);
s([
  l({ type: Number })
], i.prototype, "currentPage", 2);
s([
  l({ type: Number })
], i.prototype, "totalResults", 2);
s([
  l({ type: String })
], i.prototype, "prompt", 2);
s([
  p()
], i.prototype, "images", 2);
s([
  p()
], i.prototype, "selectedImage", 2);
s([
  p()
], i.prototype, "showSearchTab", 2);
s([
  p()
], i.prototype, "showGenerateTab", 2);
i = s([
  w("image-generate-modal")
], i);
export {
  i as default
};
//# sourceMappingURL=ImageGenerateModalElement-CZhfKbA1.js.map
