document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the chat elements
    const chatLauncher = document.getElementById('chat-launcher');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // --- Event listeners to toggle chat visibility ---
    chatLauncher.addEventListener('click', () => {
        chatContainer.classList.remove('hidden');
        chatLauncher.classList.add('hidden');
        document.body.classList.add('chat-open'); // Add class to body
    });

    closeChat.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
        chatLauncher.classList.remove('hidden');
        document.body.classList.remove('chat-open'); // Remove class from body
    });

    // --- Handles the form submission to send a message ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, 'user-message');
        userInput.value = '';
        userInput.focus();

        try {
            // Send message to the backend server
            const response = await fetch('/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            addMessage(data.reply, 'bot-message');

        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, an error occurred. Please try again.', 'bot-message');
        } 
    });

    // --- Helper function to add a new message to the chat box ---
    function addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        // Scroll to the bottom to see the latest message
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});