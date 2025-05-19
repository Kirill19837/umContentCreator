import { LitElement as x, html as g, css as E, property as m, customElement as M } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as w } from "@umbraco-cms/backoffice/style";
import { UmbChangeEvent as T } from "@umbraco-cms/backoffice/event";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
import { UMB_MODAL_MANAGER_CONTEXT as C } from "@umbraco-cms/backoffice/modal";
import { T as A } from "./text-generate-modal.token-Dk8xNr9f.js";
import { UMB_PROPERTY_CONTEXT as O } from "@umbraco-cms/backoffice/property";
var b = Object.defineProperty, P = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, h = (t, e, a, r) => {
  for (var o = r > 1 ? void 0 : r ? P(e, a) : e, p = t.length - 1, l; p >= 0; p--)
    (l = t[p]) && (o = (r ? l(e, a, o) : l(o)) || o);
  return r && o && b(e, a, o), o;
}, d = (t, e, a) => e.has(t) || v("Cannot " + a), U = (t, e, a) => (d(t, e, "read from private field"), e.get(t)), _ = (t, e, a) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), S = (t, e, a, r) => (d(t, e, "write to private field"), e.set(t, a), a), u = (t, e, a) => (d(t, e, "access private method"), a), s, i, f, c;
let n = class extends y(x) {
  constructor() {
    super(), _(this, i), _(this, s), this.configurationModal = {
      caption: "",
      value: ""
    }, this.value = "", this.consumeContext(O, (t) => {
      this.configurationModal.caption = t.getAlias(), this.configurationModal.value = t.getValue();
    }), this.consumeContext(C, (t) => {
      S(this, s, t);
    });
  }
  _openModal() {
    var e;
    let t = (e = U(this, s)) == null ? void 0 : e.open(
      this,
      A,
      {
        data: {
          alias: this.configurationModal.caption,
          value: this.configurationModal.value,
          dataTypeAlias: ""
        }
      }
    );
    t == null || t.onSubmit().then((a) => {
      this.value = a.value, u(this, i, c).call(this);
    });
  }
  render() {
    return g`
      <uui-textarea
        id="custom-text-area-block"
        pristine=""
        label="Prompt"
        .value=${this.value}
        @input=${u(this, i, f)}
        rows="7"
        auto-height="false"
      >
      </uui-textarea>
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
s = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
f = function(t) {
  this.value = t.target.value, u(this, i, c).call(this);
};
c = function() {
  this.dispatchEvent(new T());
};
n.styles = [
  w,
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
h([
  m({ type: Object })
], n.prototype, "configurationModal", 2);
h([
  m({ type: String })
], n.prototype, "value", 2);
n = h([
  M("custom-text-area")
], n);
export {
  n as default
};
//# sourceMappingURL=custom-text-area-DsYCSMOr.js.map
