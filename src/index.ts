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
    }

    Object.defineProperty(o.prototype, prop.name, {
      get() {
        return this.getAttribute(elementAttr);
      },
      set(newValue: any) {
        try {
          this.setAttribute.apply(this, [elementAttr, newValue.toString()]);
        } catch(e: unknown) {
          // do nothing - often will fail during attachment but work after
        }
      }
    });
    // TODO make work right for arrays and objects
    o.prototype[prop.name] = prop.value ? new prop.type(prop.value) : new prop.type();
  }

  const existingAttributeChangedCallback = o.prototype.attributeChangedCallback;
  o.prototype.attributeChangedCallback = (name: string, oldValue: string, newValue: string) => {
    if (existingAttributeChangedCallback) {
      existingAttributeChangedCallback(name, oldValue, newValue);
    }
  }

  return o;
}

export { BindCzar }
