import React from 'react';

const platforms = ['facebook', 'instagram', 'google', 'linkedin', 'tiktok'];

export default function PlatformTabs({ active, onChange }) {
  return (
    <div className="platform-tabs">
      {platforms.map(p => (
        <button
          key={p}
          className={`platform-tab ${active === p ? 'active' : ''}`}
          onClick={() => onChange(p)}
          data-platform={p}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );
}
