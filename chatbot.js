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

        // Add message to conversation state
        function addToConversationState(message, isUser = true) {
            conversationState.push({
                role: isUser ? 'user' : 'assistant',
                content: message
            });
            
            // Keep system message + last 10 user/assistant messages
            if (conversationState.length > 11) {
                // Preserve the system message (first element) and keep last 10 user/assistant messages
                const systemMessage = conversationState[0];
                const recentMessages = conversationState.slice(-10);
                conversationState = [systemMessage, ...recentMessages];
            }
        }

        // Get conversation context for API request
        function getConversationContext() {
            return conversationState.map(msg => 
                `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
            ).join('\n');
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

            // if (response.post) {
            //     content += `
            //         <div class="post-preview">
            //             <div class="post-date">${response.post.date}</div>
            //             <div class="post-content">${response.post.content}</div>
            //             <div class="hashtags">${response.post.hashtags}</div>
            //         </div>
            //     `;
            // }

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

        function sendMessage() {
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
            // const apiUrl = 'https://caas.api.godaddy.com/v1/prompts';

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'Authorization': apiKey
                },
                body: JSON.stringify({
                    prompt: enhancedPrompt,
                    provider: 'openai_chat',
                    providerOptions: {
                        model: 'gpt-3.5-turbo'
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                hideTyping();
                const aiResponse = data.data.value || "Sorry, I couldn't generate a response.";
                
                addBotResponseWithImage({
                    text: aiResponse,
                    hasImage: false
                });
                
                // Add AI response to conversation state
                addToConversationState(aiResponse, false);
            })
            .catch(error => {
                hideTyping();
                const errorMessage = "Sorry, there was an error contacting the AI service.";
                
                addBotResponseWithImage({
                    text: errorMessage,
                });
                
                // Add error to conversation state
                addToConversationState(errorMessage, false);
            });
        }
        sendBtn.addEventListener('click', sendMessage);

        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        document.addEventListener('click', function(event) {
            if (event.target && event.target.id === 'create-image-btn') {
            // Prepare the prompt for image generation based on conversation context
            const imagePrompt = getConversationContext() + "\nPlease generate a social media image based on the above conversation.";

            // Show typing indicator
            showTyping();

            fetch('https://gdapicall.danktroopervx.workers.dev/', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'Authorization': apiKey
                },
                body: JSON.stringify({
                    prompt: imagePrompt,
                    provider: 'openai_image',
                    providerOptions: {
                        model: 'dall-e-2'
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                hideTyping();
                // Check if image was created and get the image URL
                let imageUrl = null;
                let aiText = "Here's your generated image!";
                if (data && data.data && data.data.value) {
                    if (typeof data.data.value === 'object' && data.data.value.cdn) {
                        imageUrl = data.data.value.cdn;
                    }
                    // If there's a text description, use it
                    if (data.data.value.text) {
                        aiText = data.data.value.text;
                    }
                } else {
                    // aiText = "Sorry, I couldn't generate an image.";
                }

                addBotResponseWithImage({
                    text: aiText,
                    imageUrl: 'surfer.jpeg',
                    hasImage: true
                });

                // Add AI response to conversation state
                addToConversationState(aiText, false);
            })
            .catch(error => {
                hideTyping();
                const errorMessage = "Sorry, there was an error generating the image.";
                addBotResponseWithImage({
                    text: errorMessage
                });
                addToConversationState(errorMessage, false);
            });
        }
    });

        createImageVideoContainer.addEventListener('click', function() {
            console.log('Create Video');
        });

        // Initialize
        sendBtn.disabled = true;
//         const body = {
//   prompt: chatInput.value.trim(),
//   image: selectedImageDataURL || null // Use data URL or image upload logic
// };
