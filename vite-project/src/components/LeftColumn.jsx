import React, { useState } from 'react';
import PlatformTabs from './PlatformTabs.jsx';
import PublishOptions from './PublishOptions.jsx';

// demo content
const samplePost = {
  date: 'July 14, 2025',
  text: `Ready to enhance your personal brand? 🌟 
Joel Hudgens' website offers tailored strategies and expert insights to help you stand out in your industry. 
Don't wait to make your brand unforgettable—visit today and take the first step in your branding journey! 💻✨`,
  hashtags: '#PersonalBrandingSuccess #InnovativeBranding #StandOutNow',
  image:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIg...'
};

export default function LeftColumn() {
  const [activePlatform, setActivePlatform] = useState('facebook');

  return (
    <section className="left-column flex-1 mr-6">
      <PlatformTabs active={activePlatform} onChange={setActivePlatform} />

      {/* post preview / editor */}
      <PostCard post={samplePost} />

      <PublishOptions />
    </section>
  );
}
