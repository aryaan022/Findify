document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the chat elements
    const chatLauncher = document.getElementById('chat-launcher');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = document.getElementById('typing-indicator');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    
    // Voice recognition setup
    let recognition = null;
    let isListening = false;
    let networkErrorCount = 0; // Track consecutive network errors
    
    // Check if browser supports Speech Recognition and elements exist
    if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Can be changed to 'hi-IN' for Hindi
        
        recognition.onstart = () => {
            isListening = true;
            networkErrorCount = 0; // Reset error count on successful start
            // Restore voice button if it was disabled
            if (voiceBtn) {
                voiceBtn.style.background = '#f87171';
                voiceBtn.style.color = '#fff';
                voiceBtn.style.opacity = '1';
                voiceBtn.style.cursor = 'pointer';
                voiceBtn.title = 'Click to speak';
            }
            if (voiceStatus) {
                voiceStatus.textContent = '🎤 Listening... Speak now!';
                voiceStatus.style.display = 'block';
            }
        };
        
        recognition.onresult = (event) => {
            try {
                if (!event.results || !event.results[0] || !event.results[0][0]) {
                    throw new Error('No speech detected');
                }
                const transcript = event.results[0][0].transcript;
                networkErrorCount = 0; // Reset on successful result
                if (userInput && transcript && transcript.trim()) {
                    userInput.value = transcript.trim();
                    if (voiceStatus) {
                        voiceStatus.textContent = '✓ Captured! Press Enter to send, or click the send button.';
                        voiceStatus.style.display = 'block';
                        setTimeout(() => {
                            voiceStatus.style.display = 'none';
                        }, 3000);
                    }
                    // Don't auto-submit - let user review and manually submit
                    // This prevents network errors from auto-submission
                } else {
                    if (voiceStatus) {
                        voiceStatus.textContent = '❌ No speech detected. Please try again or type your message.';
                        voiceStatus.style.display = 'block';
                        setTimeout(() => {
                            voiceStatus.style.display = 'none';
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error('Error processing speech result:', error);
                if (voiceStatus) {
                    voiceStatus.textContent = '❌ Could not capture speech. Please type your message instead.';
                    setTimeout(() => {
                        voiceStatus.style.display = 'none';
                    }, 3000);
                }
                isListening = false;
                if (voiceBtn) {
                    voiceBtn.style.background = '';
                    voiceBtn.style.color = '';
                }
                // Focus input so user can type
                if (userInput) {
                    setTimeout(() => {
                        userInput.focus();
                    }, 500);
                }
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            if (voiceBtn) {
                voiceBtn.style.background = '';
                voiceBtn.style.color = '';
            }
            if (voiceStatus) {
                let errorMessage = '❌ Error occurred';
                // Handle specific error types with helpful messages
                switch(event.error) {
                    case 'no-speech':
                        errorMessage = '❌ No speech detected. Please speak clearly and try again.';
                        break;
                    case 'audio-capture':
                        errorMessage = '❌ No microphone found. Please check your microphone connection.';
                        break;
                    case 'not-allowed':
                        errorMessage = '❌ Microphone permission denied. Please allow microphone access in your browser settings.';
                        break;
                    case 'network':
                        networkErrorCount++;
                        if (networkErrorCount >= 2) {
                            // After 2 network errors, suggest typing instead
                            errorMessage = '❌ Voice recognition needs internet. You can type your message instead - just click in the text box.';
                            // Temporarily hide voice button after multiple failures
                            if (voiceBtn && networkErrorCount >= 3) {
                                voiceBtn.style.opacity = '0.5';
                                voiceBtn.style.cursor = 'not-allowed';
                                voiceBtn.title = 'Voice unavailable. Please type your message.';
                            }
                        } else {
                            errorMessage = '❌ Network error. Voice needs internet connection. Please check your connection or type your message instead.';
                        }
                        // Focus input so user can type instead
                        setTimeout(() => {
                            if (userInput) {
                                userInput.focus();
                            }
                        }, 500);
                        break;
                    case 'aborted':
                        // Don't show error for aborted - user likely stopped it manually
                        voiceStatus.style.display = 'none';
                        return;
                    case 'service-not-allowed':
                        errorMessage = '❌ Speech recognition service unavailable. Please try again later.';
                        break;
                    default:
                        errorMessage = `❌ ${event.error ? event.error.charAt(0).toUpperCase() + event.error.slice(1).replace(/-/g, ' ') : 'Error occurred'}. Please try again.`;
                }
                voiceStatus.textContent = errorMessage;
                voiceStatus.style.display = 'block';
                setTimeout(() => {
                    voiceStatus.style.display = 'none';
                }, 5000);
            }
        };
        
        recognition.onend = () => {
            isListening = false;
            if (voiceBtn) {
                voiceBtn.style.background = '';
                voiceBtn.style.color = '';
            }
            if (voiceStatus && voiceStatus.textContent.includes('Listening')) {
                voiceStatus.style.display = 'none';
            }
        };
        
        voiceBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                try {
                    // Check if we have network connectivity before starting
                    if (!navigator.onLine) {
                        if (voiceStatus) {
                            voiceStatus.textContent = '❌ No internet. Voice needs connection. Please type your message instead.';
                            voiceStatus.style.display = 'block';
                            setTimeout(() => {
                                voiceStatus.style.display = 'none';
                            }, 4000);
                        }
                        return;
                    }
                    
                    // Try to start recognition with error handling
                    try {
                        recognition.start();
                    } catch (startError) {
                        // If recognition is already started or other error, handle gracefully
                        if (startError.name === 'InvalidStateError') {
                            // Recognition already active, just stop and restart
                            recognition.stop();
                            setTimeout(() => {
                                try {
                                    recognition.start();
                                } catch (retryError) {
                                    console.error('Retry failed:', retryError);
                                    if (voiceStatus) {
                                        voiceStatus.textContent = '❌ Could not start voice. Please type your message.';
                                        voiceStatus.style.display = 'block';
                                        setTimeout(() => {
                                            voiceStatus.style.display = 'none';
                                        }, 3000);
                                    }
                                }
                            }, 500);
                        } else {
                            throw startError;
                        }
                    }
                } catch (error) {
                    console.error('Error starting recognition:', error);
                    if (voiceStatus) {
                        let errorMsg = '❌ Voice recognition unavailable. Please type your message instead.';
                        if (error.message && error.message.includes('network')) {
                            errorMsg = '❌ Network error. Please check your connection or type your message.';
                        } else if (error.name === 'NotAllowedError') {
                            errorMsg = '❌ Microphone permission denied. Please allow access or type your message.';
                        }
                        voiceStatus.textContent = errorMsg;
                        voiceStatus.style.display = 'block';
                        setTimeout(() => {
                            voiceStatus.style.display = 'none';
                        }, 5000);
                    }
                    // Focus input so user can type instead
                    if (userInput) {
                        setTimeout(() => {
                            userInput.focus();
                        }, 100);
                    }
                }
            }
        });
    } else if (voiceBtn) {
        // Hide voice button if not supported
        voiceBtn.style.display = 'none';
    }

    // Quick suggestion buttons
    const suggestions = [
        "Find restaurants",
        "Show me cafes",
        "What is Findify?",
        "How does it work?"
    ];

    // Load conversation history from localStorage
    function loadChatHistory() {
        try {
            const saved = localStorage.getItem('findify_chat_history');
            if (saved) {
                const history = JSON.parse(saved);
                // Clear default welcome message
                chatBox.innerHTML = '';
                // Restore messages
                history.forEach(msg => {
                    if (msg.type === 'user') {
                        addMessage(msg.content, 'user-message', false);
                    } else if (msg.type === 'businesses' && msg.businesses) {
                        addBusinessCards(msg.businesses, msg.reply, false);
                    } else {
                        addMessage(msg.content, 'bot-message', false);
                    }
                });
                scrollToBottom();
            }
        } catch (err) {
            console.error('Error loading chat history:', err);
        }
    }

    // Save message to localStorage
    function saveToHistory(type, content, businesses = null) {
        try {
            const saved = localStorage.getItem('findify_chat_history') || '[]';
            const history = JSON.parse(saved);
            history.push({ type, content, businesses, timestamp: Date.now() });
            // Keep last 50 messages
            if (history.length > 50) {
                history.splice(0, history.length - 50);
            }
            localStorage.setItem('findify_chat_history', JSON.stringify(history));
        } catch (err) {
            console.error('Error saving chat history:', err);
        }
    }

    // Clear chat history
    function clearChatHistory() {
        try {
            localStorage.removeItem('findify_chat_history');
            chatBox.innerHTML = '';
            addWelcomeMessage();
        } catch (err) {
            console.error('Error clearing chat history:', err);
        }
    }

    // Add welcome message with suggestions
    function addWelcomeMessage() {
        const welcome = `Hello! 👋 I'm Findify Assistant, your intelligent guide to discovering local businesses.\n\n**How I Can Help:**\n\n🔍 **Find Businesses:** "Find restaurants", "Show me cafes"\n📚 **Learn:** "What is Findify?", "How does it work?"\n💼 **Business Owners:** "How to add my business?"\n📞 **Support:** "Help" or "Contact support"\n\n**Quick Suggestions:**`;
        addMessage(welcome, 'bot-message', false);
        addSuggestionButtons();
        // Don't save to history - we're not keeping old chats
    }

    // Add suggestion buttons
    function addSuggestionButtons() {
        const suggestionContainer = document.createElement('div');
        suggestionContainer.className = 'suggestion-buttons';
        suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = suggestion;
            btn.addEventListener('click', () => {
                userInput.value = suggestion;
                chatForm.dispatchEvent(new Event('submit'));
            });
            suggestionContainer.appendChild(btn);
        });
        chatBox.appendChild(suggestionContainer);
        scrollToBottom();
    }

    // Initialize: Don't load old history - start fresh each time
    // Clear any existing localStorage history
    localStorage.removeItem('findify_chat_history');
    
    // Show welcome message
    if (chatBox.children.length === 0 || (chatBox.children.length === 1 && chatBox.querySelector('.typing-indicator'))) {
        addWelcomeMessage();
    }

    // --- Event listeners to toggle chat visibility ---
    chatLauncher.addEventListener('click', () => {
        // Clear old history when opening chat - start fresh
        localStorage.removeItem('findify_chat_history');
        
        // Show welcome message if chat box is empty
        if (chatBox.children.length === 0 || chatBox.innerHTML.trim() === '') {
            addWelcomeMessage();
        }
        
        chatContainer.classList.remove('hidden');
        chatLauncher.classList.add('hidden');
        document.body.classList.add('chat-open');
        userInput.focus();
    });

    closeChat.addEventListener('click', async () => {
        // Clear chat history when closing
        try {
            // Clear localStorage
            localStorage.removeItem('findify_chat_history');
            
            // Clear session history on server
            try {
                await fetch('/chatbot/clear-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin'
                });
            } catch (err) {
                console.error('Error clearing server history:', err);
            }
            
            // Clear chat box
            chatBox.innerHTML = '';
            
        } catch (err) {
            console.error('Error clearing chat history:', err);
        }
        
        chatContainer.classList.add('hidden');
        chatLauncher.classList.remove('hidden');
        document.body.classList.remove('chat-open');
    });

    // Keyboard shortcuts: Enter to send, Shift+Enter for new line
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Show typing indicator
    function showTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            scrollToBottom();
        }
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.classList.add('hidden');
        }
    }

    // Simple markdown parser for bold, links, and lists
    function parseMarkdown(text) {
        if (!text) return '';
        
        // Escape HTML first
        let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Parse markdown links: [text](/url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            if (url.startsWith('/')) {
                return `<a href="${url}" class="chat-link">${text}</a>`;
            }
            return `<a href="${url}" class="chat-link" target="_blank" rel="noopener">${text}</a>`;
        });
        
        // Parse bold: **text**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Parse numbered lists: 1. item or • item
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/^•\s+(.+)$/gm, '<li>$1</li>');
        
        // Wrap consecutive <li> tags in <ul>
        html = html.replace(/(<li>.*<\/li>)/g, (match) => {
            if (match.includes('<ul>')) return match;
            return '<ul>' + match.replace(/<\/li><li>/g, '</li><li>') + '</ul>';
        });
        
        // Parse line breaks
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    // Add business cards
    function addBusinessCards(businesses, replyText = '', animate = true) {
        // Add the reply text if provided
        if (replyText) {
            addMessage(replyText, 'bot-message', animate);
        }

        // Create business cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'business-cards-container';
        
        businesses.forEach(business => {
            const card = document.createElement('div');
            card.className = 'business-card';
            card.innerHTML = `
                <div class="business-card-header">
                    <h4>${escapeHtml(business.name)}</h4>
                    <span class="business-category">${escapeHtml(business.category)}</span>
                </div>
                <div class="business-card-info">
                    ${business.rating !== 'N/A' ? `<span class="business-rating">⭐ ${business.rating}</span>` : ''}
                    ${business.reviewCount > 0 ? `<span class="business-reviews">${business.reviewCount} reviews</span>` : ''}
                </div>
                <a href="${business.link}" class="business-card-link">View Details →</a>
            `;
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('business-card-link')) {
                    window.location.href = business.link;
                }
            });
            cardsContainer.appendChild(card);
        });

        if (animate) {
            cardsContainer.style.opacity = '0';
            cardsContainer.style.transform = 'translateY(20px)';
        }
        
        chatBox.appendChild(cardsContainer);
        
        if (animate) {
            setTimeout(() => {
                cardsContainer.style.transition = 'all 0.3s ease';
                cardsContainer.style.opacity = '1';
                cardsContainer.style.transform = 'translateY(0)';
            }, 50);
        }
        
        scrollToBottom();
        // Don't save to history - we're not keeping old chats
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Handles the form submission to send a message ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        // Check network connectivity before submitting
        if (!navigator.onLine) {
            addMessage('⚠️ No internet connection. Please check your connection and try again.', 'bot-message');
            return;
        }

        // Remove suggestion buttons if they exist
        const suggestionButtons = chatBox.querySelector('.suggestion-buttons');
        if (suggestionButtons) {
            suggestionButtons.remove();
        }

        addMessage(userMessage, 'user-message');
        // Don't save to history - we're not keeping old chats
        userInput.value = '';
        userInput.focus();

        // Show typing indicator
        showTypingIndicator();

        try {
            // Send message to the backend server with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            const response = await fetch('/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
                credentials: 'same-origin',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            hideTypingIndicator();

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ reply: 'Network error occurred' }));
                throw new Error(errorData.reply || `Server error: ${response.status}`);
            }

            const data = await response.json();

            // Handle different response types
            if (data.type === 'businesses' && data.businesses && data.businesses.length > 0) {
                addBusinessCards(data.businesses, data.reply);
            } else {
                addMessage(data.reply, 'bot-message');
                // Don't save to history - we're not keeping old chats
            }

            // Show suggestion buttons after bot response
            if (data.type !== 'businesses' && !data.reply.includes('more') && !data.reply.includes('Found')) {
                setTimeout(() => {
                    addSuggestionButtons();
                }, 300);
            }

        } catch (error) {
            hideTypingIndicator();
            console.error('Error:', error);
            
            let errorMsg = 'Sorry, an error occurred. Please try again.';
            
            if (error.name === 'AbortError') {
                errorMsg = '⏳ Request timeout. Please check your connection and try again.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
                errorMsg = '❌ Network error. Please check your internet connection and try again.';
            } else if (error.message) {
                errorMsg = `⚠️ ${error.message}`;
            }
            
            addMessage(errorMsg, 'bot-message');
            // Don't save to history - we're not keeping old chats
        }
    });

    // --- Enhanced helper function to add a new message to the chat box ---
    function addMessage(text, className, animate = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        
        // Parse markdown and set innerHTML
        messageDiv.innerHTML = parseMarkdown(text);
        
        if (animate) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(10px)';
        }
        
        chatBox.appendChild(messageDiv);
        
        if (animate) {
            requestAnimationFrame(() => {
                messageDiv.style.transition = 'all 0.3s ease';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            });
        }
        
        scrollToBottom();
    }

    // Smooth scroll to bottom
    function scrollToBottom() {
        setTimeout(() => {
            chatBox.scrollTo({
                top: chatBox.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    // Auto-resize textarea (if user wants multi-line support later)
    if (userInput.tagName === 'TEXTAREA') {
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
});