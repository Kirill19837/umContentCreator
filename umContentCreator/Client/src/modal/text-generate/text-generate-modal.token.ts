import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import { TextGenerateModalData, TextGenerateModalValue } from '../../types';

export const TEXT_GENERATE_MODAL_TOKEN = new UmbModalToken<TextGenerateModalData, TextGenerateModalValue>('Text.Generate.Modal', {
    modal: {
        type: 'dialog',
        size: 'small'
    }
});