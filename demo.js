import { BindCzar } from './dist/index.js';

const prop1 = {
  type: String,
  name: 'name',
  value: 'Jack',
  attribute: 'person-name'
};

const prop2 = {
  type: Number,
  name: 'num',
  // value: 100
};

const prop3 = {
  type: String,
  name: 'textArea',
  attribute: 'text-area'
};

const prop4 = {
  type: String,
  name: 'dropDown',
  attribute: 'drop-down'
};

const TestComponent = BindCzar(class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <p>
        Hello, <span bc-name>${this.name}</span>!
      </p>
      <p>
        <input type="text" bc-name value="${this.name}">
      </p>
      <tr>
      <p>
        I'm a number: <span bc-num>${this.num}</span>!
      </p>
      <p>
        <input type="number" bc-num value="${this.num}">
      </p>
      <p bc-textArea></p>
      <div>
        <textarea bc-textArea>${this.textArea}</textArea>
      </div>
      <p bc-dropDown></p>
      <p>
        <select bc-dropDown>
          <option value="one">one</option>
          <option value="two">two</option>
          <option value="three">three</option>
          <option value="four">four</option>
          <option value="five">five</option>
        </select>
      </p>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('bam!!!');
    // console.log(name);
    // console.log(newValue);
  }
}, prop1, prop2, prop3, prop4);

export { TestComponent }
