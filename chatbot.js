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

// Add message to conversation state (no length management here)
function addToConversationState(message, isUser = true) {
    conversationState.push({
        role: isUser ? 'user' : 'assistant',
        content: message
    });
}

// Get conversation context for regular chat (can be long)
function getConversationContext() {
    return conversationState.map(msg => 
        `${msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System'}: ${msg.content}`
    ).join('\n');
}

// Create optimized image generation prompt using AI
async function createImagePrompt() {
    const fullContext = getConversationContext();
    
    // Create a prompt for the AI to summarize the conversation into an image generation prompt
    const summarizationPrompt = `Based on this conversation, create a concise image generation prompt (under 900 characters) that captures:
1. The specific type of image needed (social media post, announcement, etc.)
2. Visual style and mood
3. Key content elements (text, objects, people, etc.)
4. Brand/business context
5. Platform requirements (Instagram, Facebook, etc.)

Make it detailed enough for DALL-E to create an engaging social media image.

Conversation:
${fullContext}

Create the image prompt:`;

    try {
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
        let imagePrompt = data.data.value || "Create a professional social media image with engaging colors and clear messaging.";
        
        // Ensure it's under 900 characters
        if (imagePrompt.length > 900) {
            imagePrompt = imagePrompt.substring(0, 897) + "...";
        }
        
        console.log('Generated image prompt:', imagePrompt);
        console.log('Image prompt length:', imagePrompt.length);
        
        return imagePrompt;
        
    } catch (error) {
        console.error('Error creating image prompt:', error);
        
        // Fallback: create a simple prompt from recent messages
        const recentMessages = conversationState
            .filter(msg => msg.role !== 'system')
            .slice(-4)
            .map(msg => msg.content)
            .join(' ');
        
        const fallbackPrompt = `Create a professional social media image based on: ${recentMessages}. Use engaging colors, clear layout, and modern design.`;
        
        return fallbackPrompt.length > 900 ? fallbackPrompt.substring(0, 897) + "..." : fallbackPrompt;
    }
}

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    sendBtn.disabled = !this.value.trim();
});

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

    // Get full conversation context for regular chat
    const context = getConversationContext();
    
    // Build enhanced prompt with context
    const enhancedPrompt = context ? 
        `Previous conversation:\n${context}\n\nCurrent message: ${message}\n\nPlease respond considering the conversation history.` : 
        message;

    try {
        const response = await fetch('https://gdapicall.danktroopervx.workers.dev/', {
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
        
    } catch (error) {
        hideTyping();
        console.error('Error sending message:', error);
        const errorMessage = "Sorry, there was an error contacting the AI service.";
        
        addBotResponseWithImage({
            text: errorMessage,
        });
        
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

// Enhanced image generation with AI-optimized prompts
document.addEventListener('click', async function(event) {
    if (event.target && event.target.id === 'create-image-btn') {
        showTyping();
        
        try {
            // First, create an optimized image prompt using AI
            const optimizedPrompt = await createImagePrompt();
            
            console.log('Using optimized prompt for image generation');
            
            // Then use that optimized prompt for image generation
            const response = await fetch('https://gdapicall.danktroopervx.workers.dev/', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: optimizedPrompt,
                    provider: 'openai_image',
                    providerOptions: {
                        model: 'dall-e-2',
                        size: '1024x1024'
                    }
                })
            });
            
            const data = await response.json();
            console.log('Image API response:', data);
            hideTyping();
            
            let imageUrl = null;
            let aiText = "Here's your generated image based on our conversation!";
            
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
            
            // Handle success/error cases
            if (!imageUrl) {
                console.error('No image URL found in response:', data);
                aiText = "Sorry, I couldn't generate an image. Please try again.";
                addBotResponseWithImage({
                    text: aiText,
                    hasImage: false
                });
            } else {
                addBotResponseWithImage({
                    text: aiText,
                    imageUrl: imageUrl,
                    hasImage: true
                });
            }
            
            // Add AI response to conversation state
            addToConversationState(aiText, false);
            
        } catch (error) {
            console.error('Image generation error:', error);
            hideTyping();
            const errorMessage = "Sorry, there was an error generating the image. Please try again.";
            addBotResponseWithImage({
                text: errorMessage,
                hasImage: false
            });
            addToConversationState(errorMessage, false);
        }
    }
});

// Video generation placeholder
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'create-video-btn') {
        addBotResponseWithImage({
            text: "Video generation feature coming soon! For now, I can help you create engaging images for your social media content.",
            hasImage: false
        });
    }
});

// Initialize
sendBtn.disabled = true;

// Debug functions
window.debugConversation = function() {
    console.log('Current conversation state:', conversationState);
    console.log('Full context length:', getConversationContext().length);
    console.log('Full context:', getConversationContext());
};

window.testImagePrompt = async function() {
    const prompt = await createImagePrompt();
    console.log('Test image prompt:', prompt);
    console.log('Length:', prompt.length);
};