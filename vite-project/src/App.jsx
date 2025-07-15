import React from 'react';
import Header from './components/Header.jsx';
import LeftColumn from './components/LeftColumn.jsx';
import ConnectionsPanel from './components/ConnectionsPanel.jsx';

// ←‑‑ real data would come from props, an API, or context
const platforms = [
  { platformName: 'Facebook',  platformIconUrl: '/icons/facebook.svg',  connectionState: 'Not connected' },
  { platformName: 'Instagram', platformIconUrl: '/icons/instagram.svg', connectionState: 'Not connected' },
  { platformName: 'Google',    platformIconUrl: '/icons/google.svg',    connectionState: 'Not connected' },
];

export default function App() {
  return (
    <div className="container">
      <Header />

      <div className="main-content md:flex">
        <LeftColumn />

        {/* right column / connections */}
        <ConnectionsPanel platforms={platforms} />
      </div>
    </div>
  );
}
