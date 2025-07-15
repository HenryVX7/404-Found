const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');
const createImageVideoContainer = document.getElementsByClassName('create-image-video-container');
const messageBot = document.getElementsByClassName('messageBot');

// Simple conversation state array with initial system instruction
let conversationState = [
    {
        role: 'system',
        content: 'You are a chatbot whose purpose is to ask the user targeted, relevant questions needed to generate an AI image or video related to a website or announcement. The generated content will be used to create traction on their social media platforms. Use both the current and previous messages as context to inform your questions and responses. Your goal is to gather all necessary details to create an effective, visually compelling AI-generated image or video optimized for social media engagement. In every response you create, provide an outline of the promotional material you plan to generate (i.e.image/video) if that is what the user is asking for.'
    }
];

// Configuration for conversation management
const MAX_CONVERSATION_LENGTH = 8; // Maximum number of user/assistant pairs before summarization
const SUMMARIZATION_THRESHOLD = 6; // When to trigger summarization

// Add message to conversation state
function addToConversationState(message, isUser = true) {
    conversationState.push({
        role: isUser ? 'user' : 'assistant',
        content: message
    });
    
    // Check if we need to summarize the conversation
    const userAssistantMessages = conversationState.filter(msg => msg.role !== 'system');
    
    if (userAssistantMessages.length > MAX_CONVERSATION_LENGTH) {
        summarizeConversation();
    }
}

// Summarize conversation using AI
async function summarizeConversation() {
    try {
        const systemMessage = conversationState[0];
        const userAssistantMessages = conversationState.filter(msg => msg.role !== 'system');
        
        // Keep the last few messages and summarize the rest
        const messagesToSummarize = userAssistantMessages.slice(0, -SUMMARIZATION_THRESHOLD);
        const recentMessages = userAssistantMessages.slice(-SUMMARIZATION_THRESHOLD);
        
        if (messagesToSummarize.length === 0) {
            return; // Nothing to summarize
        }
        
        // Create summarization prompt
        const conversationText = messagesToSummarize
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');
        
        const summarizationPrompt = `Please create a concise summary of this conversation that captures the key context needed for an AI content creation assistant. Focus on:
1. The type of content the user wants to create (image/video)
2. The target platform/audience
3. Key details about the business/topic
4. Any specific requirements or preferences mentioned

Conversation to summarize:
${conversationText}

Create a summary that's no more than 3-4 sentences and maintains the essential context for future responses.`;

        // Call AI for summarization
        const response = await fetch('https://gdapicall.danktroopervx.workers.dev/', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: summarizationPrompt,
                provider: 'openai_chat',
                providerOptions: {
                    model: 'gpt-3.5-turbo',
                    max_tokens: 200
                }
            })
        });
        
        const data = await response.json();
        const summary = data.data.value || "Previous conversation about content creation.";
        
        // Update conversation state with summary
        conversationState = [
            systemMessage,
            {
                role: 'system',
                content: `Previous conversation summary: ${summary}`
            },
            ...recentMessages
        ];
        
        console.log('Conversation summarized successfully');
        
    } catch (error) {
        console.error('Error summarizing conversation:', error);
        // Fallback: just keep recent messages
        const systemMessage = conversationState[0];
        const recentMessages = conversationState.slice(-SUMMARIZATION_THRESHOLD);
        conversationState = [systemMessage, ...recentMessages];
    }
}

// Get conversation context for API request
function getConversationContext() {
    return conversationState.map(msg => 
        `${msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System'}: ${msg.content}`
    ).join('\n');
}

// Get conversation length for monitoring
function getConversationLength() {
    return conversationState.filter(msg => msg.role !== 'system').length;
}

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    
    sendBtn.disabled = !this.value.trim();
});

// Sample responses for demo
const sampleResponses = [
    {
        text: "I'll create a motivational fitness post for you!",
        hasImage: true,
        imageText: "🏋️ Fitness motivation image\n\nEnergetic workout scene with inspiring quotes about consistency and progress",
        post: {
            date: "July 14, 2025",
            content: "Your only competition is who you were yesterday! 💪 Every workout, every healthy choice, every step forward is building the stronger, healthier version of yourself. Start where you are, use what you have, do what you can. #FitnessJourney #HealthyLifestyle #MotivationMonday",
            hashtags: "#FitnessMotivation #HealthyLiving #StrongMindset"
        }
    },
    {
        text: "Here's a professional LinkedIn post about productivity:",
        hasImage: true,
        imageText: "📊 Professional productivity graphic\n\nClean infographic showing time management tips and productivity statistics",
        post: {
            date: "July 14, 2025",
            content: "The secret to productivity isn't working harder—it's working smarter. 🧠 Focus on your top 3 priorities each day, eliminate distractions, and remember that saying 'no' to good opportunities makes room for great ones.",
            hashtags: "#ProductivityTips #WorkSmarter #ProfessionalGrowth"
        }
    },
    {
        text: "I can help you create engaging content! What specific topic or industry would you like me to focus on? I can generate posts for fitness, business, technology, lifestyle, or any other niche.",
        hasImage: false
    }
];

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${isUser ? 'You' : 'AI'}</div>
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotResponseWithImage(response) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';

    let content = response.text;

    if (response.hasImage) {
        content += `
            <div class="image-preview">
                <img src="${response.imageUrl}" alt="Image Preview">
            </div>
        `;
    }

    messageDiv.innerHTML = `
        <div class="message-avatar">AI</div>
            <div class="message-content-container">
            <div class="message-content">
                ${content}
            </div>
            <div class="create-image-video-container">
            <div id="create-image-btn">Create Image</div>
            <div id="create-video-btn">Create Video</div>
            </div>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
    typingIndicator.style.display = 'none';
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to UI and state
    addMessage(message, true);
    addToConversationState(message, true);
    
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    showTyping();

    // Get conversation context
    const context = getConversationContext();
    
    // Build enhanced prompt with context
    const enhancedPrompt = context ? 
        `Previous conversation:\n${context}\n\nCurrent message: ${message}\n\nPlease respond considering the conversation history.` : 
        message;

    // Call GoDaddy CaaS API for AI response
    const apiUrl = 'https://gdapicall.danktroopervx.workers.dev/';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: enhancedPrompt,
                provider: 'openai_chat',
                providerOptions: {
                    model: 'gpt-3.5-turbo'
                }
            })
        });
        
        const data = await response.json();
        hideTyping();
        const aiResponse = data.data.value || "Sorry, I couldn't generate a response.";
        
        addBotResponseWithImage({
            text: aiResponse,
            hasImage: false
        });
        
        // Add AI response to conversation state
        addToConversationState(aiResponse, false);
        
        // Log current conversation length for monitoring
        console.log(`Conversation length: ${getConversationLength()} messages`);
        
    } catch (error) {
        hideTyping();
        console.error('Error sending message:', error);
        const errorMessage = "Sorry, there was an error contacting the AI service.";
        
        addBotResponseWithImage({
            text: errorMessage,
        });
        
        // Add error to conversation state
        addToConversationState(errorMessage, false);
    }
}

sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Enhanced image generation with better context handling
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'create-image-btn') {
        // Create a more specific prompt for image generation
        const context = getConversationContext();
        
        // Extract recent relevant context for image generation
        const recentMessages = conversationState
            .filter(msg => msg.role !== 'system')
            .slice(-4) // Get last 4 user/assistant messages
            .map(msg => msg.content)
            .join(' ');
        
        // Create a focused image prompt
        const imagePrompt = `Create a social media image based on this conversation context: ${recentMessages}. Make it visually appealing for social media with engaging colors, clear text if needed, and professional quality suitable for business marketing.`;
        
        console.log('Generating image with prompt:', imagePrompt);
        
        // Show typing indicator
        showTyping();
        
        // Call the API for image generation
        fetch('https://gdapicall.danktroopervx.workers.dev/', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: imagePrompt,
                provider: 'openai_image',
                providerOptions: {
                    model: 'dall-e-2',
                    size: '1024x1024'
                }
            })
        })
        .then(response => {
            console.log('Image API response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Image API response data:', data);
            hideTyping();
            
            let imageUrl = null;
            let aiText = "Here's your generated image!";
            
            // Handle different possible response structures
            if (data && data.data) {
                if (typeof data.data.value === 'string') {
                    imageUrl = data.data.value;
                } else if (data.data.value && data.data.value.url) {
                    imageUrl = data.data.value.url;
                } else if (data.data.value && data.data.value.cdn) {
                    imageUrl = data.data.value.cdn;
                } else if (data.data.url) {
                    imageUrl = data.data.url;
                }
            }
            
            // Handle error cases
            if (!imageUrl) {
                console.error('No image URL found in response:', data);
                aiText = "Sorry, I couldn't generate an image. Please try again.";
                addBotResponseWithImage({
                    text: aiText,
                    hasImage: false
                });
            } else {
                // Successfully got image URL
                addBotResponseWithImage({
                    text: aiText,
                    imageUrl: imageUrl,
                    hasImage: true
                });
            }
            
            // Add AI response to conversation state
            addToConversationState(aiText, false);
        })
        .catch(error => {
            console.error('Image generation error:', error);
            hideTyping();
            const errorMessage = "Sorry, there was an error generating the image. Please try again.";
            addBotResponseWithImage({
                text: errorMessage,
                hasImage: false
            });
            addToConversationState(errorMessage, false);
        });
    }
});

// Video generation placeholder (can be expanded later)
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'create-video-btn') {
        console.log('Create Video clicked');
        // Placeholder for video generation functionality
        addBotResponseWithImage({
            text: "Video generation feature coming soon! For now, I can help you create engaging images for your social media content.",
            hasImage: false
        });
    }
});

// Initialize
sendBtn.disabled = true;

// Add conversation state monitoring for debugging
window.debugConversation = function() {
    console.log('Current conversation state:', conversationState);
    console.log('Conversation length:', getConversationLength());
};

// Optional: Add a function to manually trigger summarization for testing
window.triggerSummarization = function() {
    summarizeConversation();
};