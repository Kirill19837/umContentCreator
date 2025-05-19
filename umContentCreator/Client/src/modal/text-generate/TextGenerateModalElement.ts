import { css, customElement, html, LitElement, property } from '@umbraco-cms/backoffice/external/lit';
import { UmbModalExtensionElement } from '@umbraco-cms/backoffice/modal';
import type { UmbModalContext } from '@umbraco-cms/backoffice/modal';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { TextGenerateModalData, TextGenerateModalValue } from '../../types';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_NOTIFICATION_CONTEXT, UmbNotificationColor, UmbNotificationContext } from '@umbraco-cms/backoffice/notification';


@customElement('text-generate-modal')
export default class GenerateTextModelElement
    extends UmbElementMixin(LitElement)
    implements UmbModalExtensionElement<TextGenerateModalData, TextGenerateModalValue> {

    #notificationContext?: UmbNotificationContext;

    constructor() {
        super();
        this.consumeContext(UMB_NOTIFICATION_CONTEXT, (instance) => {
            this.#notificationContext = instance;
        })
    }

    @property({ attribute: false })
    modalContext?: UmbModalContext<TextGenerateModalData, TextGenerateModalValue>;

    @property({ attribute: false })
    data?: TextGenerateModalData;

    @property({ type: Number })
    maxTokens: number = 1024;
    
    @property({ type: Number })
    temperature: number = 0.4;
    
    @property({ type: String })
    prompt: string = ""; 

    @property({type: Boolean})
    isGenerating: boolean = false;

    @property({type: String})
    generatedText: string = "";


    static styles  = [
        UmbTextStyles,
        css`
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
    ]

    private _handleMxTokensChange(event: Event) {
        const target = event.target as HTMLInputElement;
        this.maxTokens = Number(target.value);
    }

    private _handleTemperatureChange(event: Event) {
        const target = event.target as HTMLInputElement;
        this.temperature = Number(target.value);
    }

    private _handlePrompt(event: Event) {
        const target = event.target as HTMLTextAreaElement;
        this.prompt = target.value;
      }

    private _handleGeneratedText(event: Event){
        const target = event.target as HTMLTextAreaElement;
        this.generatedText = target.value; 
    }

    private async _generateText(){
        try {
             const requestData = {
              prompt: this.prompt,
              maxTokens: this.maxTokens,
              temperature: this.temperature,
              propertyEditorAlias: this.modalContext?.data.dataTypeAlias
            };
        
            const response = await fetch('/api/umContentCreator/getGeneratedText', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData),
            });
        
            if (!response.ok) {
              const error = await response.text();
              this.showNotification(`Error: ${response.status} - ${error}`, 'danger');
            }

            const result = await response.text(); 
        
            this.generatedText = result;
        
          } catch (error) {
            if (error instanceof Error) {
              this.showNotification(error.message, 'danger');
            } else {
              this.showNotification('An unknown error occurred', 'danger');
            }
          }

    }

    private _updateContent(replace: boolean){
        if(replace){
            this.modalContext?.updateValue({value: this.generatedText});
        }
        else{
            this.modalContext?.updateValue({value: `${this.modalContext?.data.value} ${this.generatedText}`});
        }
        this.modalContext?.submit();
    }

    private _gettemperatureLabel(index: number){
        const temperatureLabels: Record<number, string> = {
            0.2: 'Conservative',
            0.4: 'Cautious',
            0.6: 'Balanced',
            0.8: 'Creative',
            1.0: 'Adventurous'
        };

        return temperatureLabels[index];
    }

    showNotification(message: string, type: UmbNotificationColor) {
        this.#notificationContext?.peek(type, {
            data: {
                message: message
            }
        })
    }
    
    
    private _handleCancel() {
        this.modalContext?.submit();
    }



    render() {
        return html`
        <uui-modal-dialog>
        <uui-dialog-layout class="layout">
                    <span 
             class="close-modal" 
             @click=${this._handleCancel}>
            &times;
             </span>
         <div class="um-modal-title">
             <h2>Create content for <span>${this.modalContext?.data.alias}</spam></h2>
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

                 ${this.isGenerating
                 ? html`
                 <div class="loading-container">
                     <uui-loader-bar style="color: #006eff"></uui-loader-bar>
                 </div>
                 ` : ''}

                 ${this.generatedText && !this.isGenerating
                 ? html`
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
                 `
                 : ''}

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

                     ${this.generatedText
                     ? html`
                     <uui-button 
                     pristine="" 
                     label="Replace" 
                     look="primary" 
                     ?disabled=${!this.generatedText}
                     @click=${() => this._updateContent(true)}></uui-button>
                     `
                     : ''}

                     ${this.modalContext?.data.value && this.generatedText
                     ? html`
                     <uui-button 
                     pristine="" 
                     label="Append" 
                     look="primary" 
                     @click=${() => this._updateContent(false)}></uui-button>
                     `
                     : ''}
                 </div>
                 </div>
             </div>
         </div>
     </div>

              </uui-dialog-layout>
         </uui-modal-dialog>
        `;
    }
}