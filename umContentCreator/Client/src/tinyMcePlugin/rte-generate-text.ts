import { UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import { TinyMcePluginArguments, UmbTinyMcePluginBase } from '@umbraco-cms/backoffice/tiny-mce';
import { TEXT_GENERATE_MODAL_TOKEN } from '../modal/text-generate/text-generate-modal.token';
import { UMB_PROPERTY_CONTEXT} from '@umbraco-cms/backoffice/property';


export default class UmbTinyMceMediaPickerPlugin extends UmbTinyMcePluginBase {

    #modalManagerContext?: typeof UMB_MODAL_MANAGER_CONTEXT.TYPE;
    #umbPropertyContext?: typeof UMB_PROPERTY_CONTEXT.TYPE;

    private _openModal() {
        let value = this.#umbPropertyContext?.getValue();
        let modalContenxt = this.#modalManagerContext?.open(this, TEXT_GENERATE_MODAL_TOKEN, {
            data: {
                alias: this.#umbPropertyContext?.getAlias(),
                value: value == undefined ? '' : value.markup,
                dataTypeAlias: 'Umbraco.TinyMCE'
            },
        });


        modalContenxt?.onSubmit().then((val) => {
            this.editor.setContent(val.value);
        });
    }

    constructor(args: TinyMcePluginArguments) {
        super(args);

        // Add your plugin code here
        args.editor.ui.registry.addButton('generateTextButton', {
            text: 'Generate Text',
            icon: 'code-sample',
            onAction: () => {
                this._openModal();
            }
        });

        this.consumeContext(UMB_PROPERTY_CONTEXT, (instance) => {
            this.#umbPropertyContext = instance;
        })

        this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (instance) => {
            this.#modalManagerContext = instance;
        });
    }
}