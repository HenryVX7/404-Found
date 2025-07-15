import React, { useState } from 'react';
import GenericButton from './GenericButton.jsx';

export default function PublishOptions() {
  const [option, setOption] = useState('now');

  return (
    <div className="publish-options">
      <div className="radio-group">
        {['now', 'later'].map(v => (
          <label key={v} className="radio-option">
            <input
              type="radio"
              name="publish-option"
              value={v}
              checked={option === v}
              onChange={() => setOption(v)}
            />
            {v === 'now' ? 'Publish now' : 'Schedule for later'}
          </label>
        ))}
      </div>

      <div className="action-buttons">
        <GenericButton>Edit Post</GenericButton>
        <GenericButton
          onClick={() => alert(`${option === 'now' ? 'Publishing' : 'Scheduling'} …`)}
        >
          {option === 'now' ? 'Publish' : 'Schedule'}
        </GenericButton>
      </div>
    </div>
  );
}
