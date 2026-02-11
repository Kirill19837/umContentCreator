import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { UMB_PROPERTY_CONTEXT } from "@umbraco-cms/backoffice/property";
import {
  Editor,
  UmbTiptapToolbarElementApiBase,
} from "@umbraco-cms/backoffice/tiptap";
import { TEXT_GENERATE_MODAL_TOKEN } from "../modal/text-generate/text-generate-modal.token";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
export default class GenerateTextTiptapToolbarElementApi extends UmbTiptapToolbarElementApiBase {
  #modalManagerContext?: typeof UMB_MODAL_MANAGER_CONTEXT.TYPE;
  #umbPropertyContext?: typeof UMB_PROPERTY_CONTEXT.TYPE;

  constructor(host: UmbControllerHost) {
    super(host);

    this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (instance) => {
      this.#modalManagerContext = instance;
    });

    this.consumeContext(UMB_PROPERTY_CONTEXT, (instance) => {
      this.#umbPropertyContext = instance;
    });
  }

  private _openModal(editor: Editor) {
    let value = this.#umbPropertyContext?.getValue();
    let modalContenxt = this.#modalManagerContext?.open(
      this,
      TEXT_GENERATE_MODAL_TOKEN,
      {
        data: {
          alias: this.#umbPropertyContext?.getAlias(),
          value: value == undefined ? "" : value.markup,
          dataTypeAlias: "Umbraco.RichText",
        },
      },
    );

    modalContenxt?.onSubmit().then((val) => {
      editor?.commands.setContent(val.value);
    });
  }
  override execute(editor?: Editor) {
    if(editor === undefined) return;
    this._openModal(editor);
  }
}
