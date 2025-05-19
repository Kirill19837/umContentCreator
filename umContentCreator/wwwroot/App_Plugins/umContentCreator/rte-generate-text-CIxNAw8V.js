var d = (t) => {
  throw TypeError(t);
};
var p = (t, o, e) => o.has(t) || d("Cannot " + e);
var s = (t, o, e) => (p(t, o, "read from private field"), e ? e.call(t) : o.get(t)), r = (t, o, e) => o.has(t) ? d("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(t) : o.set(t, e), m = (t, o, e, i) => (p(t, o, "write to private field"), i ? i.call(t, e) : o.set(t, e), e);
import { UMB_MODAL_MANAGER_CONTEXT as M } from "@umbraco-cms/backoffice/modal";
import { UmbTinyMcePluginBase as h } from "@umbraco-cms/backoffice/tiny-mce";
import { T as E } from "./text-generate-modal.token-Dk8xNr9f.js";
import { UMB_PROPERTY_CONTEXT as _ } from "@umbraco-cms/backoffice/property";
var n, a;
class O extends h {
  constructor(e) {
    super(e);
    r(this, n);
    r(this, a);
    e.editor.ui.registry.addButton("generateTextButton", {
      text: "Generate Text",
      icon: "code-sample",
      onAction: () => {
        this._openModal();
      }
    }), this.consumeContext(_, (i) => {
      m(this, a, i);
    }), this.consumeContext(M, (i) => {
      m(this, n, i);
    });
  }
  _openModal() {
    var u, l, T;
    let e = (u = s(this, a)) == null ? void 0 : u.getValue(), i = (T = s(this, n)) == null ? void 0 : T.open(this, E, {
      data: {
        alias: (l = s(this, a)) == null ? void 0 : l.getAlias(),
        value: e == null ? "" : e.markup,
        dataTypeAlias: "Umbraco.TinyMCE"
      }
    });
    i == null || i.onSubmit().then((c) => {
      this.editor.setContent(c.value);
    });
  }
}
n = new WeakMap(), a = new WeakMap();
export {
  O as default
};
//# sourceMappingURL=rte-generate-text-CIxNAw8V.js.map
