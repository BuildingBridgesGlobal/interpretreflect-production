import React from 'react';

export function DebugApp() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh', 
      padding: '20px',
      color: 'black'
    }}>
      <h1>Debug Test</h1>
      <p>If you can see this, the app is loading correctly.</p>
      <p>Stripe Integration Status: Ready</p>
      <a href="/pricing" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go to Pricing Page
      </a>
    </div>
  );
}