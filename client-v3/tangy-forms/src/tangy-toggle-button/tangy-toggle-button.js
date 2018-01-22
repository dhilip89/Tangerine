import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../tangy-form/tangy-element-styles.js';
/**
 * `tangy-toggle-button`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyToggleButton extends Element {
  static get template() {
    return `
    <style>
      :host {
        display: inline-block;
        border: solid 3px #777;
        border-radius: 15px;
        padding: 15px;
        color: #777;
        font-size: 1em;
        text-align: center;

      }
      :host([hidden]) {
        display: none;
      }
      :host([pressed]) {
        background: var(--primary-color);
        color: #FFF;
      }
      :host([highlighted]) {
        border-color: var(--accent-color);
      }
      :host([required]:not([disabled])) label::before  { 
        content: "*"; 
        color: red; 
        position: absolute;
        top: 4px;
        right: 5px;
      }
      .text-outer {
        position: relative;
        height: 100%;
      }
      .text-inner {
        position: absolute;
        top: 68%;
        left: 50%;
        height: 30%;
        width: 50%;
        margin: -15% 0 0 -25%;
      }

      .text-inner ::slotted(*) {
        text-align: center;
      }
    </style>
    <div class="text-outer">
      <div class="text-inner">
        <slot></slot>
      </div>
    </div>
`;
  }

  static get is() { return 'tangy-toggle-button'; }
  static get properties() {
    return {
      name: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: '',
        reflectToAttribute: true,
        observer: 'onValueChange'
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      highlighted: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      pressed: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.togglePressed.bind(this))
  }

  togglePressed() {
    if (this.disabled) return
    if (this.value == '') {
      this.value = 'on'
    } else {
      this.value = ''
    }
  }

  onValueChange(newState, oldState) {
    if (newState == '') {
      this.pressed = false
    } else {
      this.pressed = true
    }
  }
}

window.customElements.define(TangyToggleButton.is, TangyToggleButton);