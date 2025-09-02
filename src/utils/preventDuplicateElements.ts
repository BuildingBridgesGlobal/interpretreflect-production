// Prevent duplicate custom element registration errors
// This can happen with certain browser extensions or hot module reloading

export function preventDuplicateCustomElements() {
  // Store the original customElements.define method
  const originalDefine = window.customElements.define;
  
  // Override the define method to check if element already exists
  window.customElements.define = function(name: string, constructor: any, options?: any) {
    // Check if the element is already defined
    if (!window.customElements.get(name)) {
      // Element not defined, proceed with registration
      originalDefine.call(window.customElements, name, constructor, options);
    } else {
      // Element already defined, skip registration
      console.warn(`Custom element "${name}" is already defined, skipping registration.`);
    }
  };
}

// Initialize on import
if (typeof window !== 'undefined' && window.customElements) {
  preventDuplicateCustomElements();
}