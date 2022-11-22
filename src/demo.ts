import { BindCzar } from './';

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

const prop5 = {
  type: Array,
  name: 'dropDownValues',
  attribute: 'drop-down-values',
  value: []
}

@BindCzar(prop1, prop2, prop3, prop4, prop5)
class TestComponent extends HTMLElement {
  connectedCallback() {
    // @ts-ignore
    const { name, num, textArea } = this;
    this.innerHTML = /* html */ `
      <p>
        Hello, <span bc-name>${name}</span>!
      </p>
      <p>
        <input type="text" bc-name value="${name}">
      </p>
      <tr>
      <p>
        I'm a number: <span bc-num>${num}</span>!
      </p>
      <p>
        <input type="number" bc-num value="${num}">
      </p>
      <p bc-textArea></p>
      <div>
        <textarea bc-textArea>${textArea || ''}</textArea>
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

  // @ts-ignore
  // attributeChangedCallback(name, oldValue, newValue) {
    // console.log('bam!!!');
    // console.log(' ');
    // console.log(name);
    // console.log(newValue);
  // }
}

export { TestComponent }
