import React from 'react';
import { Link } from 'react-router-dom';
import GenericButton from './GenericButton.jsx';

export default function ConnectionsPanel({ platforms }) {
  return (
    <div className="connections-panel p-6 bg-white rounded-2xl shadow-md">
      {platforms.map(({ platformName, platformIconUrl, connectionState }) => (
        <div
          key={platformName}
          className="connection-item flex items-center justify-between mb-5"
        >
          <div className="connection-info flex items-center">
            <img
              src={platformIconUrl}
              alt={`${platformName} icon`}
              className="w-10 h-10 mr-4 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {platformName}
              </h3>
              <p
                className={`text-sm font-medium ${
                  connectionState === 'Connected'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {connectionState}
              </p>
            </div>
          </div>

          {/* Show "Manage" for connected platforms, "Connect" otherwise */}
          {connectionState === 'Connected' ? (
            <Link to={`/settings/${platformName.toLowerCase()}`}>  
              <GenericButton variant="secondary">
                Manage
              </GenericButton>
            </Link>
          ) : (
            <GenericButton onClick={() => console.log(`Connect ${platformName}`)}>
              Connect
            </GenericButton>
          )}
        </div>
      ))}
    </div>)
}
