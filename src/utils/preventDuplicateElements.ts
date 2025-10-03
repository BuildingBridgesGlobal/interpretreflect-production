// Prevent duplicate custom element registration errors
// This typically happens with browser extensions (Grammarly, LastPass, etc.) that inject custom elements

const KNOWN_EXTENSION_ELEMENTS = [
  'mce-autosize-textarea',  // TinyMCE or similar editor extensions
  'grammarly-',              // Grammarly extension elements
  'lastpass-',               // LastPass extension elements
  '1password-',              // 1Password extension elements
];

export function preventDuplicateCustomElements() {
  // Store the original customElements.define method
  const originalDefine = window.customElements.define.bind(window.customElements);
  
  // Override the define method to check if element already exists
  window.customElements.define = function(name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) {
    try {
      // Check if the element is already defined
      if (window.customElements.get(name)) {
        // Check if this is likely from a browser extension
        const isExtensionElement = KNOWN_EXTENSION_ELEMENTS.some(prefix => 
          name.toLowerCase().includes(prefix.toLowerCase())
        );
        
        if (isExtensionElement) {
          // Silently ignore extension elements - they're not our problem
          return;
        } else {
          // Log a warning for our own elements
          console.warn(`Custom element "${name}" is already defined, skipping registration.`);
        }
        return;
      }
      
      // Element not defined, proceed with registration
      originalDefine(name, constructor, options);
    } catch (error) {
      // Catch any errors from the define operation
      if (error instanceof DOMException && error.name === 'NotSupportedError') {
        // This specific error means the element was already defined
        // Silently ignore for known extension elements
        const isExtensionElement = KNOWN_EXTENSION_ELEMENTS.some(prefix => 
          name.toLowerCase().includes(prefix.toLowerCase())
        );
        
        if (!isExtensionElement) {
          console.warn(`Failed to define custom element "${name}":`, error.message);
        }
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  };
}

// Initialize on import
if (typeof window !== 'undefined' && window.customElements) {
  preventDuplicateCustomElements();
  
  // Log if we detect common extensions
  if (typeof window !== 'undefined') {
    // Check for Grammarly
    if (document.querySelector('[data-grammarly-shadow-root]')) {
      console.info('Grammarly extension detected - custom element conflicts have been handled.');
    }
    
    // Add a small delay to check for late-loading extensions
    setTimeout(() => {
      const customElementNames = Array.from({ length: 100 }, (_, i) => {
        try {
          const elem = document.querySelector(`[is], [data-*]`);
          return elem ? elem.tagName : null;
        } catch {
          return null;
        }
      }).filter(Boolean);
      
      if (window.customElements.get('mce-autosize-textarea')) {
        console.info('TinyMCE or similar editor extension detected - conflicts handled.');
      }
    }, 1000);
  }
}