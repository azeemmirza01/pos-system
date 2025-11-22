import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error('Failed to render app:', error);
    
    // Show error on screen
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; min-height: 100vh;">
        <h1 style="color: #ff4d4f;">Error Loading Application</h1>
        <p style="color: #666; margin: 20px 0;"><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p style="color: #999; margin-top: 20px;">Please check the browser console (DevTools) for more details.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload</button>
      </div>
    `;
  }
}

