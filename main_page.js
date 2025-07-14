// Store business data
let businessData = {};
let connectedPlatforms = {};

// Tab switching
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// Business form handling
document.getElementById('business-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    businessData = {
        name: document.getElementById('business-name').value,
        type: document.getElementById('business-type').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        website: document.getElementById('website').value,
        address: document.getElementById('address').value,
        description: document.getElementById('description').value,
        hours: document.getElementById('hours').value
    };
    
    updateBusinessDisplay();
    showSuccessMessage('Business information saved successfully!');
});

function updateBusinessDisplay() {
    const display = document.getElementById('business-display');
    if (businessData.name) {
        display.innerHTML = `
            <div class="info-item">
                <div class="info-label">Business Name:</div>
                <div>${businessData.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Type:</div>
                <div>${businessData.type}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Phone:</div>
                <div>${businessData.phone}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email:</div>
                <div>${businessData.email}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Website:</div>
                <div>${businessData.website}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Address:</div>
                <div>${businessData.address}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Description:</div>
                <div>${businessData.description}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Hours:</div>
                <div style="white-space: pre-line;">${businessData.hours}</div>
            </div>
        `;
        
        // Update Google Maps iframe if address exists
        if (businessData.address && businessData.address.trim()) {
            updateGoogleMap(businessData.address);
        }
    }
}

function updateGoogleMap(address) {
    const encodedAddress = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedAddress}`;
    
    // For demo purposes, we'll use the search URL without API key
    const demoMapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.4037384847976!2d-74.00601768463421!3d40.71278517932857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e809b3b%3A0x1c2b4b0e7b8c6c7d!2s${encodedAddress}!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus`;
    
    // Use a generic search URL that works without API key
    const searchMapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    
    const mapFrame = document.getElementById('google-map');
    mapFrame.src = searchMapUrl;
    
    // Show the map container
    document.getElementById('map-container').style.display = 'block';
}

// Platform connection
function connectPlatform(platform) {
    // Simulate connection process
    setTimeout(() => {
        connectedPlatforms[platform] = true;
        const card = event.target.closest('.platform-card');
        const status = card.querySelector('.status');
        status.textContent = 'Connected';
        status.classList.remove('disconnected');
        status.classList.add('connected');
        
        event.target.textContent = 'Disconnect';
        event.target.classList.add('danger');
        event.target.onclick = () => disconnectPlatform(platform);
        
        showSuccessMessage(`Successfully connected to ${platform}!`);
    }, 1000);
}

function disconnectPlatform(platform) {
    connectedPlatforms[platform] = false;
    const card = event.target.closest('.platform-card');
    const status = card.querySelector('.status');
    status.textContent = 'Not Connected';
    status.classList.remove('connected');
    status.classList.add('disconnected');
    
    event.target.textContent = `Connect ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
    event.target.classList.remove('danger');
    event.target.onclick = () => connectPlatform(platform);
}

function syncAllPlatforms() {
    if (Object.keys(connectedPlatforms).length === 0) {
        alert('Please connect at least one platform first!');
        return;
    }
    
    document.getElementById('sync-success').style.display = 'block';
    setTimeout(() => {
        document.getElementById('sync-success').style.display = 'none';
    }, 5000);
}

// AI Post Generation from Prompt
async function generatePostFromPrompt() {
    const prompt = document.getElementById('ai-prompt').value;
    const postType = document.getElementById('post-type').value;
    
    if (!prompt.trim()) {
        alert('Please enter a prompt for the AI to work with!');
        return;
    }
    
    // Show loading state
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '⏳ Generating...';
    button.disabled = true;
    
    try {
        // Simulate API call to generate content
        const generatedContent = await generateContentFromPrompt(prompt, postType);
        
        // Update the post content
        document.getElementById('post-content').value = generatedContent;
        updateCharacterCount();
        
        showSuccessMessage('AI post generated successfully!');
        
    } catch (error) {
        console.error('Error generating content:', error);
        alert('Sorry, there was an error generating your post. Please try again.');
    } finally {
        // Reset button
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Simulate AI content generation API
async function generateContentFromPrompt(prompt, postType) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const businessName = businessData.name || 'Your Business';
    
    // Enhanced AI-style content generation based on prompt and business data
    let generatedContent = '';
    
    // Analyze the prompt for key elements
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('sale') || promptLower.includes('discount') || promptLower.includes('deal')) {
        generatedContent = `🎯 Exciting News! ${businessName} is offering ${extractOfferDetails(prompt)}! Don't miss out on this amazing opportunity to save. Visit us today and see what deals await you! #Sale #Savings #${businessName.replace(/\s+/g, '')}`;
    } else if (promptLower.includes('new') && (promptLower.includes('product') || promptLower.includes('service'))) {
        generatedContent = `✨ We're thrilled to announce something new at ${businessName}! ${prompt} We can't wait for you to experience what we've been working on. Stop by and check it out! #NewArrival #Innovation #${businessName.replace(/\s+/g, '')}`;
    } else if (promptLower.includes('closed') || promptLower.includes('holiday') || promptLower.includes('hours')) {
        generatedContent = `📅 Important Update: ${prompt} We appreciate your understanding and look forward to serving you soon! Follow us for the latest updates. #BusinessUpdate #${businessName.replace(/\s+/g, '')}`;
    } else if (promptLower.includes('thank') || promptLower.includes('appreciate') || promptLower.includes('grateful')) {
        generatedContent = `💝 From all of us at ${businessName}: ${prompt} Your support means everything to us, and we're committed to continuing to provide you with the best experience possible! #ThankYou #Community #${businessName.replace(/\s+/g, '')}`;
    } else if (promptLower.includes('event') || promptLower.includes('celebration') || promptLower.includes('party')) {
        generatedContent = `🎉 You're invited! ${businessName} is excited to share: ${prompt} Join us for what's sure to be an amazing time. We hope to see you there! #Event #Community #${businessName.replace(/\s+/g, '')}`;
    } else {
        // General prompt handling
        generatedContent = `Hey everyone! ${businessName} here with an update: ${prompt} We're always working to better serve our community, and we appreciate your continued support! #Update #${businessName.replace(/\s+/g, '')}`;
    }
    
    // Add business-specific touches if we have the data
    if (businessData.type) {
        const businessTypeHashtag = businessData.type.charAt(0).toUpperCase() + businessData.type.slice(1);
        generatedContent += ` #${businessTypeHashtag}`;
    }
    
    return generatedContent;
}

// Helper function to extract offer details from prompt
function extractOfferDetails(prompt) {
    const percentMatch = prompt.match(/(\d+)%/);
    const dollarMatch = prompt.match(/\$(\d+)/);
    
    if (percentMatch) {
        return `${percentMatch[1]}% off select items`;
    } else if (dollarMatch) {
        return `${dollarMatch[1]} off your purchase`;
    } else if (prompt.toLowerCase().includes('buy one get one') || prompt.toLowerCase().includes('bogo')) {
        return 'Buy One Get One deals';
    } else if (prompt.toLowerCase().includes('flash sale')) {
        return 'flash sale pricing';
    } else {
        return 'special deals';
    }
}
function updatePostTemplate() {
    const type = document.getElementById('post-type').value;
    const content = document.getElementById('post-content');
    
    const templates = {
        'general': 'Hey everyone! We wanted to share an update with you...',
        'hours': '📅 Hours Update: We\'ve updated our business hours. Please check our new schedule...',
        'holiday': '🎉 Holiday Notice: We\'ll be closed for [Holiday Name] on [Date]. We\'ll reopen on [Date]. Thank you for your understanding!',
        'promotion': '🎯 Special Offer: Don\'t miss out on our limited-time promotion...',
        'new-service': '✨ Exciting News: We\'re thrilled to announce our new service/product...'
    };
    
    content.value = templates[type] || templates['general'];
    updateCharacterCount();
}

function updateCharacterCount() {
    const content = document.getElementById('post-content').value;
    document.getElementById('char-count').textContent = content.length;
    
    // Update preview
    document.getElementById('post-preview-content').textContent = content || 'Your post will appear here...';
}

function schedulePost() {
    const content = document.getElementById('post-content').value;
    if (!content.trim()) {
        alert('Please enter some content for your post!');
        return;
    }
    
    document.getElementById('post-success').style.display = 'block';
    setTimeout(() => {
        document.getElementById('post-success').style.display = 'none';
    }, 5000);
}

function postNow() {
    const content = document.getElementById('post-content').value;
    if (!content.trim()) {
        alert('Please enter some content for your post!');
        return;
    }
    
    showSuccessMessage('Your post has been published immediately!');
}

// Content generation
function generateContent() {
    const contentType = document.getElementById('content-type').value;
    const tone = document.getElementById('tone').value;
    const details = document.getElementById('specific-details').value;
    
    // Simulate AI content generation
    const generatedContent = generateContentBasedOnType(contentType, tone, details);
    
    document.getElementById('generated-text').textContent = generatedContent;
    document.getElementById('generated-content').style.display = 'block';
}

function generateContentBasedOnType(type, tone, details) {
    const businessName = businessData.name || 'Your Business';
    
    const templates = {
        'holiday-closure': {
            'professional': `${businessName} will be closed on ${details || '[Holiday Date]'} in observance of the holiday. We will resume normal business operations on [Return Date]. Thank you for your understanding.`,
            'friendly': `Hey everyone! 🎉 We'll be taking a break on ${details || '[Holiday Date]'} to celebrate with our families. We'll be back and ready to serve you on [Return Date]! Have a wonderful holiday!`,
            'casual': `Heads up! We're closed ${details || '[Holiday Date]'} for the holiday. Back in action [Return Date]. Enjoy your day off too! 😊`
        },
        'hours-change': {
            'professional': `${businessName} has updated business hours. ${details || 'Please see our new schedule below.'} We appreciate your understanding during this transition.`,
            'friendly': `Hi friends! 📅 We've made some changes to our hours. ${details || 'Check out our new schedule!'} Thanks for rolling with the changes!`,
            'casual': `Hey! Quick update - we tweaked our hours. ${details || 'New times are...'} Hope this works better for everyone! 🕐`
        },
        'weather-closure': {
            'apologetic': `Due to severe weather conditions, ${businessName} will be closed today for the safety of our staff and customers. ${details || 'We will reopen as soon as conditions improve.'} Stay safe everyone!`,
            'professional': `${businessName} is temporarily closed due to inclement weather. ${details || 'We will monitor conditions and reopen when safe to do so.'} Thank you for your patience.`
        }
    };
    
    return templates[type]?.[tone] || templates[type]?.['professional'] || `Here's a custom message for your ${type} announcement. ${details}`;
}

function useGeneratedContent() {
    const generatedText = document.getElementById('generated-text').textContent;
    document.getElementById('post-content').value = generatedText;
    updateCharacterCount();
    showTab('social-media');
}

function regenerateContent() {
    generateContent();
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    successDiv.style.position = 'fixed';
    successDiv.style.top = '20px';
    successDiv.style.right = '20px';
    successDiv.style.zIndex = '1000';
    successDiv.style.maxWidth = '300px';
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Initialize character count
updateCharacterCount();