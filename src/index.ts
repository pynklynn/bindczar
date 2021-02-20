export type BCPropertySpec = {
  name: string;
  type: any;
  value?: unknown;
  attribute?: string;
}

// TODO figure out a better type, possibly HTMLElement with some extensions
function BindCzar(o: any) {
  if (!o.observedAttributes) {
    o.observedAttributes = [];
  }

  return o;
}

// TODO figure out what typing to use for type
function bcProperty({ name, type, value, attribute}: BCPropertySpec): any {
  this.constructor.observedAttributes.push(name);

  // TODO make work right for arrays and objects
  return value ? new type(value) : new type();
}

export {
  BindCzar,
  bcProperty
}
