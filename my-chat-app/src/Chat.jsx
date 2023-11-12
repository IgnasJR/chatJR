import React, { useState, useEffect } from 'react';

function Chat({
  currentUserId,
  conversations,
  messages,
  handleUserSelection,
  selectedConversation,
  handleAddConversation,
  handleInputChange,
  newMessage,
  handleSendMessage,
}) {
  
  let [newUserInput, setNewUserInput] = useState('');
  let selectedConversationData = conversations.find(
    (conversation) => conversation.user_id === selectedConversation
  );

  let selectedUsername = selectedConversationData
    ? selectedConversationData.username
    : null;

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h2>Users:</h2>
        <ul className="user-list">
          {conversations.map((conversation) => (
            <li
              key={conversation.id}
              onClick={() => handleUserSelection(conversation.conversation_id)}
            >
              {conversation.username}
            </li>
          ))}
        </ul>
        <div className="add-user-container">
          <input
            type="text"
            placeholder="New User"
            className="form-input"
            value={newUserInput}
            onChange={(e) => setNewUserInput(e.target.value)}
          />
          <button
            onClick={() => handleAddConversation(newUserInput)}
            className="form-button"
          >
            Add User
          </button>
        </div>
      </div>
      <div className="message-container">
        <h2>
          {selectedUsername
            ? selectedUsername
            : 'Select a user to chat with or add a new user'}
        </h2>

        <ul className="message-list">
          {messages.map((message) => (
            <li key={message.id} className={`message-item `}>
            <div className="message-sender">{message.sender_name}</div>
            <div className={`message-content ${message.sender_id === currentUserId ? 'self-message' : 'other-message'}`}>
              {message.message_content}
            </div>
          </li>
          ))}
        </ul>
        <div className="input-container">
          <input
            className="send-textbox"
            type="text"
            placeholder="New Message"
            value={newMessage}
            onChange={handleInputChange}
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>
      </div>
      
    </div>
  );
}

export default Chat;
