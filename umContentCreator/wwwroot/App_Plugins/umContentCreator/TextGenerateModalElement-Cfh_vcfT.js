import { LitElement as c, html as l, css as x, property as n, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as v } from "@umbraco-cms/backoffice/style";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as f } from "@umbraco-cms/backoffice/notification";
var T = Object.defineProperty, y = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, s = (e, t, a, i) => {
  for (var r = i > 1 ? void 0 : i ? y(t, a) : t, u = e.length - 1, d; u >= 0; u--)
    (d = e[u]) && (r = (i ? d(t, a, r) : d(r)) || r);
  return i && r && T(t, a, r), r;
}, m = (e, t, a) => t.has(e) || h("Cannot " + a), _ = (e, t, a) => (m(e, t, "read from private field"), t.get(e)), C = (e, t, a) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), $ = (e, t, a, i) => (m(e, t, "write to private field"), t.set(e, a), a), p;
let o = class extends b(c) {
  constructor() {
    super(), C(this, p), this.maxTokens = 1024, this.temperature = 0.4, this.prompt = "", this.isGenerating = !1, this.generatedText = "", this.consumeContext(f, (e) => {
      $(this, p, e);
    });
  }
  _handleMxTokensChange(e) {
    const t = e.target;
    this.maxTokens = Number(t.value);
  }
  _handleTemperatureChange(e) {
    const t = e.target;
    this.temperature = Number(t.value);
  }
  _handlePrompt(e) {
    const t = e.target;
    this.prompt = t.value;
  }
  _handleGeneratedText(e) {
    const t = e.target;
    this.generatedText = t.value;
  }
  async _generateText() {
    var e;
    try {
      const t = {
        prompt: this.prompt,
        maxTokens: this.maxTokens,
        temperature: this.temperature,
        propertyEditorAlias: (e = this.modalContext) == null ? void 0 : e.data.dataTypeAlias
      }, a = await fetch("/api/umContentCreator/getGeneratedText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(t)
      });
      if (!a.ok) {
        const r = await a.text();
        this.showNotification(`Error: ${a.status} - ${r}`, "danger");
      }
      const i = await a.text();
      this.generatedText = i;
    } catch (t) {
      t instanceof Error ? this.showNotification(t.message, "danger") : this.showNotification("An unknown error occurred", "danger");
    }
  }
  _updateContent(e) {
    var t, a, i, r;
    e ? (t = this.modalContext) == null || t.updateValue({ value: this.generatedText }) : (i = this.modalContext) == null || i.updateValue({ value: `${(a = this.modalContext) == null ? void 0 : a.data.value} ${this.generatedText}` }), (r = this.modalContext) == null || r.submit();
  }
  _gettemperatureLabel(e) {
    return {
      0.2: "Conservative",
      0.4: "Cautious",
      0.6: "Balanced",
      0.8: "Creative",
      1: "Adventurous"
    }[e];
  }
  showNotification(e, t) {
    var a;
    (a = _(this, p)) == null || a.peek(t, {
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
    var e, t;
    return l`
        <uui-modal-dialog>
        <uui-dialog-layout class="layout">
                    <span 
             class="close-modal" 
             @click=${this._handleCancel}>
            &times;
             </span>
         <div class="um-modal-title">
             <h2>Create content for <span>${(e = this.modalContext) == null ? void 0 : e.data.alias}</spam></h2>
         </div>
         <div class="um-content-creator">
             <div class="content">
                 <div class="slider-element">
                     <span>Max words per response:</span>
                     <uui-slider 
                     step="1" 
                     min="5" 
                     max="2048" 
                     .value=${this.maxTokens}
                     label="Max words per response:" 
                     @input=${this._handleMxTokensChange}>
                     ></uui-slider>
                 </div>
                 <div class="slider-element">
                     <span>Model behaviour: ${this._gettemperatureLabel(this.temperature)}</span>
                     <uui-slider 
                     pristine="true" 
                     step="0.2" 
                     min="0.2" 
                     max="1.0" 
                     .value=${this.temperature}
                     label="Max words per response:" 
                     @input=${this._handleTemperatureChange}>
                     ></uui-slider>
                 </div>

                 <div>
                     <label for="promptTextArea">What would you like to generate?</label>
                     <uui-textarea 
                     pristine="" 
                     label="Prompt" 
                     .value=${this.prompt} 
                     @input=${this._handlePrompt} 
                     rows="5"
                     auto-height="false"
                     placeholder="Enter a prompt...">
                     </uui-textarea>
                 </div>

                 ${this.isGenerating ? l`
                 <div class="loading-container">
                     <uui-loader-bar style="color: #006eff"></uui-loader-bar>
                 </div>
                 ` : ""}

                 ${this.generatedText && !this.isGenerating ? l`
                 <div class="generated-text">
                     <label for="generatedText">Generated text:</label>
                     <uui-textarea 
                     pristine="" 
                     label="Label"
                     auto-height="false" 
                     .value=${this.generatedText}
                     @input=${this._handleGeneratedText}>
                     </uui-textarea>
                 </div>
                 ` : ""}

            <div class=buttons-container> 
            <div class="generate-button">
                <uui-button 
                 pristine="" 
                 label="Generate" 
                 look="primary" 
                 ?disabled=${!this.prompt || this.isGenerating}
                 @click=${this._generateText}></uui-button>
                 </div>
                 <div class="um-content-creator-buttons">

                     ${this.generatedText ? l`
                     <uui-button 
                     pristine="" 
                     label="Replace" 
                     look="primary" 
                     ?disabled=${!this.generatedText}
                     @click=${() => this._updateContent(!0)}></uui-button>
                     ` : ""}

                     ${(t = this.modalContext) != null && t.data.value && this.generatedText ? l`
                     <uui-button 
                     pristine="" 
                     label="Append" 
                     look="primary" 
                     @click=${() => this._updateContent(!1)}></uui-button>
                     ` : ""}
                 </div>
                 </div>
             </div>
         </div>
     </div>

              </uui-dialog-layout>
         </uui-modal-dialog>
        `;
  }
};
p = /* @__PURE__ */ new WeakMap();
o.styles = [
  v,
  x`
        uui-dialog-layout{
        position: relative;
        min-width: 550px;
        }
        .close-modal{
         position: absolute;
         top: 30px;
         right: 30px;
         font-size: 30px;
         cursor: pointer;
        }
         .um-modal-title span{
         color: #1565C0;
         }
         uui-slider{
         width: 100%
         }
        .slider-element span{
         margin-bottom: 20px;
         display: inline-block;
        }
        .buttons-container{
        display: flex;
        justify-content: space-between;
        }
        .loading-container{
        margin-top: 15px;
        margin-bottom: 15px;
        }
        `
];
s([
  n({ attribute: !1 })
], o.prototype, "modalContext", 2);
s([
  n({ attribute: !1 })
], o.prototype, "data", 2);
s([
  n({ type: Number })
], o.prototype, "maxTokens", 2);
s([
  n({ type: Number })
], o.prototype, "temperature", 2);
s([
  n({ type: String })
], o.prototype, "prompt", 2);
s([
  n({ type: Boolean })
], o.prototype, "isGenerating", 2);
s([
  n({ type: String })
], o.prototype, "generatedText", 2);
o = s([
  g("text-generate-modal")
], o);
export {
  o as default
};
//# sourceMappingURL=TextGenerateModalElement-Cfh_vcfT.js.map
