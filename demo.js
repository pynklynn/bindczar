import { BindCzar, bcProperty } from './dist/index.js';

// export class TestComponent extends HTMLElement {
const TestComponent = BindCzar(class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <p>Hello, ${this.name}!</p>
    `;
  }

  name = bcProperty.call(this, ({ type: String, name: 'name', value: 'Jack' }));
});

export { TestComponent }