// script.js
let isSending = false;
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

async function sendMessage() {
    if (isSending) {
        return;
    }

    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (message === '') {
        return;
    }

    displayMessage('user', message);

    try {
        disableSendButton();
        const botResponse = await getBotResponse(message);
        displayMessage('bot', botResponse);
    } catch (error) {
        console.error('Error fetching bot response:', error);
        const errorMessage = "Oh no! Something went wrong on my end. I apologize for the inconvenience. Please try again later.";
        displayErrorMessage(errorMessage);
        writeErrorToFile(error);
    } finally {
        enableSendButton();
        userInput.value = '';
        userInput.focus();
    }
}

function disableSendButton() {
    isSending = true;
    document.getElementById('send-button').setAttribute('disabled', 'true');
}

function enableSendButton() {
    isSending = false;
    document.getElementById('send-button').removeAttribute('disabled');
}

async function getBotResponse(userMessage) {
    const response = await fetch('https://api.openai.com/v1/engines/gpt-3.5-turbo/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: userMessage },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    let botResponse = data.choices[0].message.content;

    return botResponse;
}

function writeErrorToFile(error) {
    chatHistory.push({ role: 'error', content: error.toString() });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function displayMessage(sender, text) {
    const chatDisplay = document.getElementById('chat-display');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-container', sender === 'user' ? 'user-message' : 'bot-message');

    if (sender === 'bot') {
        const avatar = document.createElement('img');
        avatar.src = "https://i.ibb.co/PmFpB6V/Hu-Tao.jpg";
        avatar.alt = "Bot Avatar";
        avatar.classList.add('bot-avatar');
        messageElement.appendChild(avatar);
    }

    messageElement.textContent = text;
    chatDisplay.appendChild(messageElement);

    chatHistory.push({ role: sender, content: text });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function displayErrorMessage(errorMessage) {
    displayMessage('error', errorMessage);
}
