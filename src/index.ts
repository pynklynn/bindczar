export type BCPropertySpec = {
  name: string;
  type: any;
  value?: unknown;
  attribute?: string;
}

function BindCzar(...props: BCPropertySpec[]): Function {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    const o = constructor as any;
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
          return this[`_${prop.name}`];
        },
        set(newValue: any) {
          try {
            try {
              // handle complex types
              this[`_${prop.name}`] = JSON.parse(newValue);
            } catch (e) {
              // not a complex type so just set it
              this[`_${prop.name}`] = newValue;
            }

            if (o._meta[elementAttr].type === Array || o._meta[elementAttr].type === Object) {
              if (JSON.stringify(newValue) !== this.getAttribute(elementAttr)) {
                this.setAttribute.apply(this, [elementAttr, JSON.stringify(newValue)]);
              }
            } else {
              if (!!newValue && newValue.toString() !== this.getAttribute(elementAttr)) {
                this.setAttribute.apply(this, [elementAttr, newValue.toString()]);
              }
            }

            if (newValue !== null && newValue !== undefined) {
              Array.from(this.querySelectorAll([`[bc-${prop.name.toLowerCase()}]`])).forEach((el): void => {
                // TODO check for <template> tag
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
              });
            }
          } catch (e: unknown) {
            // do nothing - often will fail during attachment but work after
          }
        }
      });
    }

    const existingAttributeChangedCallback = o.prototype.attributeChangedCallback;
    Object.defineProperty(o.prototype, 'attributeChangedCallback', {
      value(name: string, oldValue: string, newValue: string) {
        if (existingAttributeChangedCallback) {
          existingAttributeChangedCallback.apply(this, [name, oldValue, newValue]);
        }
        let parsedValue;
        try {
          parsedValue = JSON.parse(newValue);
        } catch (e) {
          parsedValue = newValue;
        }
        if (o._meta.hasOwnProperty(name) && parsedValue !== this[o._meta[name].name]) {
          const meta = o._meta[name];
          this[meta.name] = parsedValue;
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
          const defaultAttribute = this.getAttribute(attributes[i]);
          if (defaultAttribute) {
            try {
              // handle complex types
              this[meta.name] = JSON.parse(defaultAttribute);
            } catch (e) {
              this[meta.name] = defaultAttribute;
            }
          } else if (meta.default) {
            if (meta.type === Array || meta.type === Object) {
              this[meta.name] = meta.default;
            } else {
              this[meta.name] = new meta.type(meta.default);
            }
          } else {
            this[meta.name] = new meta.type();
          }
          const selector = `textarea[bc-${attribute}],input[bc-${attribute}],select[bc-${attribute}]`;
          Array.from(document.querySelectorAll(selector)).forEach(el => {
            (el as HTMLElement).addEventListener('input', (event: Event) => {
              const target = (event.target as HTMLInputElement);
              this[attribute] = new meta.type(target.value);
            });
          });
        }
      }
    });

    // TODO disconnectedCallback
  }
}

export { BindCzar }
