import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Hello World!</h1>
      <p>React is working properly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default TestApp;