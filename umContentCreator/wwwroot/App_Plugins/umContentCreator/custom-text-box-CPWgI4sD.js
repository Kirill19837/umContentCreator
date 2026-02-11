import { LitElement as f, html as g, css as E, property as v, customElement as M } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as T } from "@umbraco-cms/backoffice/style";
import { UmbChangeEvent as w } from "@umbraco-cms/backoffice/event";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
import { UMB_MODAL_MANAGER_CONTEXT as C } from "@umbraco-cms/backoffice/modal";
import { T as O } from "./text-generate-modal.token-Dk8xNr9f.js";
import { UMB_PROPERTY_CONTEXT as b } from "@umbraco-cms/backoffice/property";
var A = Object.defineProperty, P = Object.getOwnPropertyDescriptor, c = (t) => {
  throw TypeError(t);
}, d = (t, e, o, r) => {
  for (var a = r > 1 ? void 0 : r ? P(e, o) : e, s = t.length - 1, l; s >= 0; s--)
    (l = t[s]) && (a = (r ? l(e, o, a) : l(a)) || a);
  return r && a && A(e, o, a), a;
}, h = (t, e, o) => e.has(t) || c("Cannot " + o), U = (t, e, o) => (h(t, e, "read from private field"), e.get(t)), m = (t, e, o) => e.has(t) ? c("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, o), S = (t, e, o, r) => (h(t, e, "write to private field"), e.set(t, o), o), u = (t, e, o) => (h(t, e, "access private method"), o), p, i, x, _;
let n = class extends y(f) {
  constructor() {
    super(), m(this, i), m(this, p), this.configurationModal = {
      caption: "",
      value: ""
    }, this.value = "", this.consumeContext(b, (t) => {
      this.configurationModal.caption = t == null ? void 0 : t.getAlias(), this.configurationModal.value = t == null ? void 0 : t.getValue();
    }), this.consumeContext(C, (t) => {
      S(this, p, t);
    });
  }
  _openModal() {
    var e;
    let t = (e = U(this, p)) == null ? void 0 : e.open(
      this,
      O,
      {
        data: {
          alias: this.configurationModal.caption,
          value: this.configurationModal.value,
          dataTypeAlias: ""
        }
      }
    );
    t == null || t.onSubmit().then((o) => {
      this.value = o.value, u(this, i, _).call(this);
    });
  }
  render() {
    return g`
      <uui-input
        id="suggestion-input"
        class="element"
        label="text input"
        .value=${this.value || ""}
        @input=${u(this, i, x)}
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
};
p = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
x = function(t) {
  this.value = t.target.value, u(this, i, _).call(this);
};
_ = function() {
  this.dispatchEvent(new w());
};
n.styles = [
  T,
  E`
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
    `
];
d([
  v({ type: Object })
], n.prototype, "configurationModal", 2);
d([
  v({ type: String })
], n.prototype, "value", 2);
n = d([
  M("custom-text-box")
], n);
export {
  n as default
};
//# sourceMappingURL=custom-text-box-CPWgI4sD.js.map
