import type { TemplateResult } from 'lit';
import { expect, fixture } from '@open-wc/testing';
import { html, LitElement } from 'lit';
import { HintMixin } from './hint.js';

class TestHint extends HintMixin(LitElement) {
  override firstUpdated(): void {
    this.append(document.createElement('input'));
  }

  override render(): TemplateResult {
    return this.renderHint();
  }
}

customElements.define('test-hint', TestHint);

describe('HintMixin', () => {
  let el: TestHint;

  describe('defaults', () => {
    beforeEach(async () => {
      el = await fixture(html`<test-hint></test-hint>`);
    });

    it('should have a hint slot', () => {
      const slot = el.renderRoot.querySelector('slot');

      expect(slot).to.not.be.null;
      expect(slot).to.have.attribute('name', 'hint');
    });

    it('should have a hint slot of size medium by default', () => {
      const slot = el.renderRoot.querySelector('slot');

      expect(slot).to.have.attribute('hintSize', 'md');
    });

    it('should have a hint slot of small size when set', () => {
      const slot = el.renderRoot.querySelector('slot');
      slot?.setAttribute('hintsize', 'sm');

      expect(slot).to.have.attribute('hintSize', 'sm');
    });

    it('should render the hint text', async () => {
      el.hint = 'Hello world';
      await el.updateComplete;

      const div = el.querySelector('div');

      expect(div).to.have.attribute('slot', 'hint');
      expect(div).to.have.text('Hello world');
    });

    it('should link the input to the hint', async () => {
      el.hint = 'Hello world';
      await el.updateComplete;

      const input = el.querySelector('input'),
        div = el.querySelector('div');

      expect(div?.id).to.match(/sl-hint-\d+/);
      expect(input).to.have.attribute('aria-describedby', div?.id);

      el.hint = '';
      await el.updateComplete;

      expect(input).not.to.have.attribute('aria-describedby');
    });
  });

  describe('slotted hint', () => {
    beforeEach(async () => {
      el = await fixture(html`<test-hint><p slot="hint">Hello world!</p></test-hint>`);
    });

    it('should link the hint to the input', async () => {
      const input = el.querySelector('input'),
        p = el.querySelector('p');

      expect(p?.id).to.match(/sl-hint-\d+/);
      expect(input).to.have.attribute('aria-describedby', p?.id);
    });

    it('should display the hint property over the slotted hint', async () => {
      el.hint = 'Lorem ipsum';
      await el.updateComplete;

      const p = el.querySelector('p');
      expect(p).to.have.attribute('slot', 'hint');
      expect(p).to.have.text('Lorem ipsum');
    });

    it('should update the slotted content automatically', async () => {
      el.querySelector('p')?.remove();

      const newHint = document.createElement('div');
      newHint.slot = 'hint';
      newHint.innerText = 'Foo bar';
      el.append(newHint);

      await el.updateComplete;

      const div = el.querySelector('div');
      expect(div).to.have.attribute('slot', 'hint');
      expect(div).to.have.text('Foo bar');
      expect(div?.id).to.match(/sl-hint-\d+/);

      const input = el.querySelector('input');
      expect(input).to.have.attribute('aria-describedby', div?.id);
    });
  });

  describe('disabled', () => {
    let el: TestHint;

    beforeEach(async () => {
      el = await fixture(html`<test-hint></test-hint>`);
    });

    it('should not be disabled by default', () => {
      expect(el).not.to.have.attribute('disabled');
      expect(el).not.to.match(':disabled');
    });

    it('should be disabled when the input is disabled', async () => {
      const input = el.querySelector('input');

      if (input) {
        input.disabled = true;
      }

      el.hint = 'This is a hint';
      await el.updateComplete;
      const hintSlot = el.shadowRoot?.querySelector('slot[name="hint"]');

      expect(hintSlot?.hasAttribute('disabled')).to.be.true;
    });
  });
});
