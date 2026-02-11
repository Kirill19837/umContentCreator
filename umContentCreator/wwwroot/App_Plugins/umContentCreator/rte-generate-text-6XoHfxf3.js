var h = (e) => {
  throw TypeError(e);
};
var E = (e, a, t) => a.has(e) || h("Cannot " + t);
var m = (e, a, t) => (E(e, a, "read from private field"), t ? t.call(e) : a.get(e)), p = (e, a, t) => a.has(e) ? h("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, t), l = (e, a, t, o) => (E(e, a, "write to private field"), o ? o.call(e, t) : a.set(e, t), t);
import { UMB_MODAL_MANAGER_CONTEXT as c } from "@umbraco-cms/backoffice/modal";
import { UMB_PROPERTY_CONTEXT as A } from "@umbraco-cms/backoffice/property";
import { UmbTiptapToolbarElementApiBase as x } from "@umbraco-cms/backoffice/tiptap";
import { T as M } from "./text-generate-modal.token-Dk8xNr9f.js";
var i, s;
class N extends x {
  constructor(t) {
    super(t);
    p(this, i);
    p(this, s);
    this.consumeContext(c, (o) => {
      l(this, i, o);
    }), this.consumeContext(A, (o) => {
      l(this, s, o);
    });
  }
  _openModal(t) {
    var r, T, u;
    let o = (r = m(this, s)) == null ? void 0 : r.getValue(), n = (u = m(this, i)) == null ? void 0 : u.open(
      this,
      M,
      {
        data: {
          alias: (T = m(this, s)) == null ? void 0 : T.getAlias(),
          value: o == null ? "" : o.markup,
          dataTypeAlias: "Umbraco.RichText"
        }
      }
    );
    n == null || n.onSubmit().then((_) => {
      t == null || t.commands.setContent(_.value);
    });
  }
  execute(t) {
    t !== void 0 && this._openModal(t);
  }
}
i = new WeakMap(), s = new WeakMap();
export {
  N as default
};
//# sourceMappingURL=rte-generate-text-6XoHfxf3.js.map
