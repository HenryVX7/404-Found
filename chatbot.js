const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');
const createImageVideoContainer = document.getElementsByClassName('create-image-video-container');
const messageBot = document.getElementsByClassName('messageBot');

// Configuration for very strict character limits
const MAX_CONTEXT_LENGTH = 800; // Leave room for prompt formatting
const SYSTEM_MESSAGE = "You are a chatbot for generating social media content. Ask targeted questions for AI image/video creation.";

// Minimal conversation state
let conversationState = {
    summary: "",
    recentMessages: [],
    lastUserMessage: "",
    lastAIMessage: ""
};

// Add message and manage context length
function addToConversationState(message, isUser = true) {
    if (isUser) {
        conversationState.lastUserMessage = message;
    } else {
        conversationState.lastAIMessage = message;
        // Add to recent messages as a pair
        conversationState.recentMessages.push({
            user: conversationState.lastUserMessage,
            ai: message
        });
    }
    
    // Aggressively manage context length
    manageContextLength();
}

// Manage context to stay under character limit
async function manageContextLength() {
    const currentContext = buildContextString();
    
    if (currentContext.length > MAX_CONTEXT_LENGTH) {
        // If we have recent messages, summarize the oldest ones
        if (conversationState.recentMessages.length > 1) {
            await summarizeAndTrim();
        } else {
            // If only one recent message, just keep the summary very short
            conversationState.summary = conversationState.summary.substring(0, 200) + "...";
        }
    }
}

// Build context string for API
function buildContextString() {
    let context = SYSTEM_MESSAGE;
    
    if (conversationState.summary) {
        context += `\nPrevious: ${conversationState.summary}`;
    }
    
    // Add only the most recent messages
    const recentCount = Math.min(2, conversationState.recentMessages.length);
    for (let i = conversationState.recentMessages.length - recentCount; i < conversationState.recentMessages.length; i++) {
        const msg = conversationState.recentMessages[i];
        context += `\nUser: ${msg.user}\nAI: ${msg.ai}`;
    }
    
    return context;
}

// Summarize conversation using AI
async function summarizeAndTrim() {
    try {
        // Take messages to summarize (all but the last one)
        const messagesToSummarize = conversationState.recentMessages.slice(0, -1);
        
        if (messagesToSummarize.length === 0) return;
        
        // Create very concise summarization prompt
        const conversationText = messagesToSummarize
            .map(msg => `U: ${msg.user}\nA: ${msg.ai}`)
            .join('\n');
        
        const summarizationPrompt = `Summarize this conversation in 1-2 sentences. Focus on: content type wanted, platform, business details, requirements.\n\n${conversationText}`;

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
                    max_tokens: 50
                }
            })
        });
        
        const data = await response.json();
        let newSummary = data.data.value || "Content creation discussion.";
        
        // Ensure summary is very short
        if (newSummary.length > 150) {
            newSummary = newSummary.substring(0, 147) + "...";
        }
        
        // Update state
        conversationState.summary = newSummary;
        conversationState.recentMessages = conversationState.recentMessages.slice(-1); // Keep only the last message
        
        console.log('Summarized to:', newSummary);
        
    } catch (error) {
        console.error('Summarization error:', error);
        // Fallback: just keep the most recent message
        conversationState.summary = "Previous content creation discussion.";
        conversationState.recentMessages = conversationState.recentMessages.slice(-1);
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

    // Get very concise context
    const context = buildContextString();
    
    // Create minimal prompt
    const enhancedPrompt = `${context}\nUser: ${message}\n\nRespond briefly:`;

    console.log('Prompt length:', enhancedPrompt.length);

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
                    model: 'gpt-3.5-turbo',
                    max_tokens: 150
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

// Image generation with minimal context
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'create-image-btn') {
        // Use only the most recent context for image generation
        let imageContext = "";
        
        if (conversationState.summary) {
            imageContext += conversationState.summary + " ";
        }
        
        // Add the most recent exchange
        if (conversationState.recentMessages.length > 0) {
            const recent = conversationState.recentMessages[conversationState.recentMessages.length - 1];
            imageContext += `User wants: ${recent.user}`;
        }
        
        // Keep image prompt very concise
        const imagePrompt = `Create social media image: ${imageContext}. Professional, engaging, colorful.`;
        
        console.log('Image prompt:', imagePrompt, 'Length:', imagePrompt.length);
        
        showTyping();
        
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
        .then(response => response.json())
        .then(data => {
            hideTyping();
            
            let imageUrl = null;
            let aiText = "Here's your generated image!";
            
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
            
            if (!imageUrl) {
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
    console.log('Context length:', buildContextString().length);
    console.log('Context:', buildContextString());
};

window.triggerSummarization = function() {
    summarizeAndTrim();
};