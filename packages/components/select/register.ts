import { Select } from './src/select.js';
import { SelectOption } from './src/select-option.js';
import { SelectOptionGroup } from './src/select-option-group.js';

customElements.define('sl-select', Select);
customElements.define('sl-select-option', SelectOption);
customElements.define('sl-select-option-group', SelectOptionGroup);
declare global {
  interface HTMLElementTagNameMap {
    'sl-select': Select;
    'sl-select-option': SelectOption;
    'sl-select-option-group': SelectOptionGroup;
  }
}
