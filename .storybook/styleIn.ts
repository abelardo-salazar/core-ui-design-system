// getComputedStyle from the element's own window, so it reads the iframe's media queries.
export const styleIn = (element: Element, pseudoElement?: string) =>
  element.ownerDocument.defaultView!.getComputedStyle(element, pseudoElement);
