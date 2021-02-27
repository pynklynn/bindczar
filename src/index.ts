export type BCPropertySpec = {
  name: string;
  type: any;
  value?: unknown;
  attribute?: string;
}

// TODO figure out a better type, possibly HTMLElement with some extensions
function BindCzar(o: any, ...props: BCPropertySpec[]) {
  if (!o.observedAttributes) {
    o.observedAttributes = [];
  }
  if (!o._meta) {
    o._meta = {};
  }

  o.prototype._initializedProperties = [];

  for (const prop of props) {
    const elementAttr = prop.attribute ? prop.attribute : prop.name;

    if (!o.observedAttributes.includes(elementAttr)) {
      o.observedAttributes.push(elementAttr);
    }
    if (!o._meta.hasOwnProperty(elementAttr)) {
      o._meta[elementAttr] = {
        name: prop.name,
        type: prop.type
      };
      if (prop.value) {
        o._meta[elementAttr].default = prop.value;
      }
    }

    Object.defineProperty(o.prototype, prop.name, {
      get() {
        // TODO handle re-typing
        // return this.getAttribute(elementAttr);
        return this[`_${prop.name}`];
      },
      set(newValue: any) {
        try {
          this[`_${prop.name}`] = newValue;
          // TODO handle complex types
          if (newValue.toString() != this.getAttribute(elementAttr)) {
            // TODO handle appropriate stringifying (eg arrays and objects)
            this.setAttribute.apply(this, [elementAttr, newValue.toString()]);
          }
          Array.from(this.querySelectorAll([`[bc-${prop.name.toLowerCase()}]`])).forEach((el): void => {
            if ((el as HTMLSelectElement).querySelectorAll('option').length) {
              const selectBox = el as HTMLSelectElement;
              const selectedOption = selectBox.querySelector('option[selected]');
              if (selectedOption) {
                selectedOption.removeAttribute('selected');
              }
              const newSelectedOption = selectBox.querySelector(`option[value="${newValue.toString()}"]`);
              if (newSelectedOption) {
                newSelectedOption.setAttribute('selected', '');
              }
            } else if ((el as HTMLInputElement).value) {
              (el as HTMLInputElement).value = newValue.toString();
            } else {
              (el as HTMLElement).innerHTML = newValue.toString();
            }
            // TODO handle select
          });
        } catch(e: unknown) {
          // do nothing - often will fail during attachment but work after
          // console.log(e);
        }
      }
    });
    // TODO default value not being set when the attribute isn't available
    /// possibly in connectedCallback?
    // TODO make work right for arrays and objects
    // o.prototype[prop.name] = prop.value ? new prop.type(prop.value) : new prop.type();
  }

  const existingAttributeChangedCallback = o.prototype.attributeChangedCallback;
  Object.defineProperty(o.prototype, 'attributeChangedCallback', {
    value(name: string, oldValue: string, newValue: string) {
      if (existingAttributeChangedCallback) {
        existingAttributeChangedCallback.apply(this, [name, oldValue, newValue]);
      }
      if (o._meta.hasOwnProperty(name)) {
        const meta = o._meta[name];
        // TODO handle complex types
        o.prototype[meta.name] = new meta.type(newValue);
      }
    }
  });

  const existingConnectedCallback = o.prototype.connectedCallback;
  Object.defineProperty(o.prototype, 'connectedCallback', {
    value() {
      if (existingConnectedCallback) {
        existingConnectedCallback.apply(this);
      }

      const attributes = Object.keys(o._meta);
      for (let i = 0, len = attributes.length; i < len; i++) {
        const meta = o._meta[attributes[i]];
        const attribute = meta.name;
        // this[meta.name] = meta.default ? new meta.type(meta.default) : new meta.type();
        this[meta.name] = meta.default ? new meta.type(meta.default) : null;
        // if (meta.default) {
        //   this[meta.name] = new meta.type(meta.default);
        // }
        const selector = `textarea[bc-${attribute}],input[bc-${attribute}],select[bc-${attribute}]`;
        Array.from(document.querySelectorAll(selector)).forEach(el => {
          (el as HTMLElement).addEventListener('input', (event: Event) => {
            // TODO handle complex types
            const target = (event.target as HTMLInputElement);
            this[attribute] = new meta.type(target.value);
          });
        });
      }
    }
  });

  return o;
}

export { BindCzar }
