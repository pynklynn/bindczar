import { BindCzar } from './dist/index.js';

const prop1 = {
  type: String,
  name: 'name',
  value: 'Jack',
  attribute: 'person-name'
};

const TestComponent = BindCzar(class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <p>
        Hello, <span bc-name>${this.name}</span>!
      </p>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('bam!!!!!!');
  }
}, prop1);

export { TestComponent }
