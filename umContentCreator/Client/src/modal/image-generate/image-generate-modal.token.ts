import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import { ConfigurationImageModal, ImageGenerateModalValue } from '../../types';


export const IMAGE_GENERATE_MODAL_TOKEN = new UmbModalToken<ConfigurationImageModal, ImageGenerateModalValue>('Image.Generate.Modal', {
    modal: {
        type: 'dialog',
        size: 'small'
    }
});