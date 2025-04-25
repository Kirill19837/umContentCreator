import { html as v, css as f, property as l, state as s, customElement as M } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as E } from "@umbraco-cms/backoffice/lit-element";
import { UMB_PROPERTY_CONTEXT as b } from "@umbraco-cms/backoffice/property";
import { UmbFormControlMixin as I, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as P } from "@umbraco-cms/backoffice/validation";
import { UmbChangeEvent as c } from "@umbraco-cms/backoffice/event";
import { UmbModalToken as T, UMB_MODAL_MANAGER_CONTEXT as C } from "@umbraco-cms/backoffice/modal";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as A } from "@umbraco-cms/backoffice/document";
import { UmbTextStyles as x } from "@umbraco-cms/backoffice/style";
const w = new T("Image.Generate.Modal", {
  modal: {
    type: "dialog",
    size: "small"
  }
});
var N = Object.defineProperty, B = Object.getOwnPropertyDescriptor, y = (e) => {
  throw TypeError(e);
}, i = (e, t, a, r) => {
  for (var n = r > 1 ? void 0 : r ? B(t, a) : t, d = e.length - 1, m; d >= 0; d--)
    (m = e[d]) && (n = (r ? m(t, a, n) : m(n)) || n);
  return r && n && N(t, a, n), n;
}, _ = (e, t, a) => t.has(e) || y("Cannot " + a), O = (e, t, a) => (_(e, t, "read from private field"), t.get(e)), u = (e, t, a) => t.has(e) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), U = (e, t, a, r) => (_(e, t, "write to private field"), t.set(e, a), a), $ = (e, t, a) => (_(e, t, "access private method"), a), p, h, g;
const G = "my-umb-property-editor-ui-media-picker", S = "media";
let o = class extends I(E) {
  constructor() {
    super(), u(this, h), this.mandatoryMessage = P, u(this, p), this.readonly = !1, this.configurationModal = {
      alias: "",
      value: [],
      pageId: "",
      negativePrompts: "",
      numberGenerate: 1
    }, this.negativePrompts = "", this.numberImagesGenerate = 1, this._focalPointEnabled = !1, this._preselectedCrops = [], this._allowedMediaTypes = [], this._multiple = !1, this._min = 0, this._max = 1 / 0, this.consumeContext(b, (e) => {
      this.observe(e.alias, (t) => this._alias = t), this.observe(
        e.variantId,
        (t) => this._variantId = (t == null ? void 0 : t.toString()) || "invariant"
      ), this.configurationModal.alias = e.getAlias(), this.configurationModal.value = e.getValue();
    }), this.consumeContext(A, (e) => {
      const t = e.getUnique();
      localStorage.setItem("configurationModal_pageId", t);
    }), this.consumeContext(C, (e) => {
      U(this, p, e);
    });
  }
  set config(e) {
    var r;
    if (!e) return;
    this._allowedMediaTypes = ((r = e.getValueByAlias("filter")) == null ? void 0 : r.split(",")) ?? [], this._focalPointEnabled = !!e.getValueByAlias("enableLocalFocalPoint"), this._multiple = !!e.getValueByAlias("multiple"), this._preselectedCrops = (e == null ? void 0 : e.getValueByAlias("crops")) ?? [];
    const t = e.getValueByAlias("startNodeId") ?? "";
    this._startNode = t ? { unique: t, entityType: S } : void 0;
    const a = e.getValueByAlias("validationLimit");
    this._min = (a == null ? void 0 : a.min) ?? 0, this._max = (a == null ? void 0 : a.max) ?? 1 / 0, this._negativePrompts = e.getValueByAlias("negativePrompts"), this._numberGenerate = Number(e.getValueByAlias("numberGenerate"));
  }
  _openModal() {
    var t;
    this.configurationModal.pageId = localStorage.getItem("configurationModal_pageId");
    let e = (t = O(this, p)) == null ? void 0 : t.open(
      this,
      w,
      {
        data: {
          alias: this.configurationModal.alias,
          value: this.configurationModal.value,
          pageId: this.configurationModal.pageId,
          negativePrompts: this._negativePrompts,
          numberGenerate: this._numberGenerate
        }
      }
    );
    e == null || e.onSubmit().then((a) => {
      const r = {
        key: a.key,
        mediaKey: a.mediaKey,
        focalPoint: null,
        mediaTypeAlias: "Image",
        crops: []
      };
      this._multiple ? this.value = [...this.value ?? [], r] : this.value = [r], this.dispatchEvent(new c());
    });
  }
  firstUpdated() {
    this.addFormControlElement(
      this.shadowRoot.querySelector("umb-input-rich-media")
    );
  }
  focus() {
  }
  render() {
    return v`
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
        @change=${$(this, h, g)}
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
};
p = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakSet();
g = function(e) {
  var a;
  const t = ((a = e.target.value) == null ? void 0 : a.length) === 0;
  this.value = t ? void 0 : e.target.value, this.dispatchEvent(new c());
};
o.styles = [
  x,
  f`
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
    `
];
i([
  l({ type: Boolean })
], o.prototype, "mandatory", 2);
i([
  l({ type: String })
], o.prototype, "mandatoryMessage", 2);
i([
  l({ type: Boolean, reflect: !0 })
], o.prototype, "readonly", 2);
i([
  l({ type: Object })
], o.prototype, "configurationModal", 2);
i([
  l({ type: String })
], o.prototype, "negativePrompts", 2);
i([
  l({ type: Number })
], o.prototype, "numberImagesGenerate", 2);
i([
  s()
], o.prototype, "_startNode", 2);
i([
  s()
], o.prototype, "_focalPointEnabled", 2);
i([
  s()
], o.prototype, "_preselectedCrops", 2);
i([
  s()
], o.prototype, "_allowedMediaTypes", 2);
i([
  s()
], o.prototype, "_multiple", 2);
i([
  s()
], o.prototype, "_min", 2);
i([
  s()
], o.prototype, "_max", 2);
i([
  s()
], o.prototype, "_alias", 2);
i([
  s()
], o.prototype, "_variantId", 2);
i([
  s()
], o.prototype, "_negativePrompts", 2);
i([
  s()
], o.prototype, "_numberGenerate", 2);
o = i([
  M(G)
], o);
export {
  o as UmbPropertyEditorUIMediaPickerElement,
  o as element
};
//# sourceMappingURL=custom-mediaPicker-C2N0l5N0.js.map
