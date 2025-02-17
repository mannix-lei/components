import type { IElementInternals } from 'element-internals-polyfill';
import type { CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
import type { EventEmitter } from '@sl-design-system/shared';
import {
  EventsController,
  FormControlMixin,
  HintMixin,
  ValidationController,
  event,
  hintStyles,
  requiredValidator,
  validationStyles
} from '@sl-design-system/shared';
import { LitElement, html, svg } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './checkbox.scss.js';

export type CheckboxSize = 'md' | 'lg';

/**
 * A checkbox with 3 states; unchecked, checked and intermediate.
 *
 * ```html
 *   <sl-checkbox>Foo</sl-checkbox>
 * ```
 *
 * @slot default - Text label of the checkbox. Technically there are no limits what can be put here; text, images, icons etc.
 */
export class Checkbox extends FormControlMixin(HintMixin(LitElement)) {
  /** @private */
  static formAssociated = true;

  /** @private */
  static override styles: CSSResultGroup = [validationStyles, hintStyles, styles];

  #events = new EventsController(this, {
    click: this.#onClick,
    keydown: this.#onKeydown
  });

  #validation = new ValidationController(this, {
    validators: [requiredValidator]
  });
  #initialState = false;

  /** @private Element internals. */
  readonly internals = this.attachInternals() as ElementInternals & IElementInternals;

  /** Emits when the checked state changes. */
  @event() change!: EventEmitter<boolean>;

  /** Whether the checkbox is checked. */
  @property({ type: Boolean, reflect: true }) checked?: boolean;

  /** Whether the checkbox is invalid. */
  @property({ type: Boolean, reflect: true }) invalid?: boolean;

  /** Whether the checkbox has the indeterminate state. */
  @property({ type: Boolean }) indeterminate = false;

  /** The size of the checkbox
   * @type {'md' | 'lg'} */
  @property({ reflect: true }) size: CheckboxSize = 'md';

  /** The value for the checkbox, to be used in forms. */
  @property() value?: string;

  /** @ignore */
  override connectedCallback(): void {
    super.connectedCallback();

    this.internals.role = 'checkbox';

    this.setFormControlElement(this);

    this.#validation.validate(this.checked ? this.value : undefined);

    this.#updateNoLabel();

    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = 0;
    }
  }

  /** @ignore */
  override updated(changes: PropertyValues<this>): void {
    super.updated(changes);

    if (changes.has('checked') || changes.has('indeterminate')) {
      this.internals.ariaChecked = this.indeterminate ? 'mixed' : this.checked ? 'true' : 'false';

      if (this.indeterminate) {
        this.internals.states.add('--indeterminate');
      } else {
        this.internals.states.delete('--indeterminate');
      }

      if (this.checked) {
        this.internals.states.add('--checked');
      } else {
        this.internals.states.delete('--checked');
      }
    }

    if (changes.has('checked') || changes.has('value')) {
      this.setFormValue(this.checked ? this.value : undefined);
    }
  }

  /** @ignore Stores the initial state of the checkbox */
  formAssociatedCallback(): void {
    this.#initialState = this.getAttribute('checked') === null ? false : true;
  }

  /** @ignore  Resets the checkbox to the initial state */
  formResetCallback(): void {
    this.checked = this.#initialState;
    this.#validation.validate(this.checked ? this.value : undefined);
    this.change.emit(this.checked);
  }

  override render(): TemplateResult {
    return html`
      <div @click=${this.#onToggle} class="wrapper">
        <div class="outer">
          <div class="inner">
            <svg version="1.1" aria-hidden="true" focusable="false" part="svg" viewBox="0 0 24 24">
              ${this.indeterminate
                ? svg`<path d="M4.1,12 9,12 20.3,12"></path>`
                : svg`<path d="M4.1,12.7 9,17.6 20.3,6.3"></path>`}
            </svg>
          </div>
        </div>
        <span class="label">
          <slot @slotchange=${() => this.#updateNoLabel()}></slot>
        </span>
      </div>
      ${this.renderHint()} ${this.#validation.render()}
    `;
  }

  #onClick(event: Event): void {
    // If the user clicked the label, toggle the checkbox
    if (event.target === this) {
      this.renderRoot.querySelector<HTMLElement>('.wrapper')?.click();
    }
  }

  #onKeydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    if (['Enter', ' '].includes(event.key)) {
      event.preventDefault();

      this.renderRoot.querySelector<HTMLElement>('.wrapper')?.click();
    }
  }

  #onToggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.checked = !this.checked;
    this.#validation.validate(this.checked ? this.value : undefined);
    this.change.emit(this.checked);
  }

  /**
   * Updates the `no-label` attribute based on the presence of a label.
   * @listens slotchange
   */
  #updateNoLabel(): void {
    const empty = Array.from(this.childNodes)
      .filter(
        node =>
          (node.nodeType === Node.ELEMENT_NODE && !(node as Element).hasAttribute('slot')) ||
          node.nodeType === Node.TEXT_NODE
      )
      .every(node => node.nodeType !== Node.ELEMENT_NODE && node.textContent?.trim() === '');

    this.toggleAttribute('no-label', empty);
  }
}
