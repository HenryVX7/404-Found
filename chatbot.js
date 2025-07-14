const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatMessages = document.getElementById('chatMessages');
        const typingIndicator = document.getElementById('typingIndicator');

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
            
            if (response.post) {
                content += `
                    <div class="post-preview">
                        <div class="post-date">${response.post.date}</div>
                        <div class="post-content">${response.post.content}</div>
                        <div class="hashtags">${response.post.hashtags}</div>
                    </div>
                `;
            }
            
            if (response.hasImage) {
                content += `
                    <div class="image-preview">
                        <div class="image-preview-placeholder">${response.imageText}</div>
                    </div>
                `;
            }
            
            messageDiv.innerHTML = `
                <div class="message-avatar">AI</div>
                <div class="message-content">${content}</div>
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

            addMessage(message, true);
            chatInput.value = '';
            chatInput.style.height = 'auto';
            sendBtn.disabled = true;

            showTyping();

            // Simulate AI response
            setTimeout(() => {
                hideTyping();
                const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
                addBotResponseWithImage(randomResponse);
            }, 1500);
        }

        sendBtn.addEventListener('click', sendMessage);

        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Initialize
        sendBtn.disabled = true;