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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  let selectedConversationData = conversations.find(
    (conversation) => conversation.user_id === selectedConversation
  );

  let selectedUsername = selectedConversationData
    ? selectedConversationData.username
    : null;

    const handleSendMessageClick = (e) => {
      e.preventDefault();
      handleSendMessage();
    };
    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };

  return (
    <div className={`chat-container ${sidebarOpen ? 'open-chat' : 'closed-chat'}`}>
      <div className={`sidebar ${sidebarOpen ? 'open-sidebar' : 'closed-sidebar'}`}>
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
      <div className={`message-container ${sidebarOpen ? 'open-chat' : 'closed-chat'}`}>
      <div className="msg-header">
        <div className="header-content">
          <svg width="40px" height="auto" viewBox="0 0 100 100" onClick={toggleSidebar}>
            <g>
              <path stroke="#ffffff" id="svg_5" d="m6.5725,53.97059c0,-5.43379 3.16831,-10 6.9386,-10l72.97779,0c3.77029,0 6.9386,4.56621 6.9386,10l0,-7.94117c0,5.43379 -3.16831,10 -6.9386,10l-72.97779,0c-3.77029,0 -6.9386,-4.56621 -6.9386,-10l0,7.94117z" opacity="undefined" fill="#000000"/>
              <path stroke="#ffffff" id="svg_8" d="m6.5725,25c0,-5.43379 3.16831,-10 6.93861,-10l72.97778,0c3.77029,0 6.93861,4.56621 6.93861,10l0,-7.94118c0,5.43379 -3.16832,10 -6.93861,10l-72.97778,0c-3.7703,0 -6.93861,-4.56621 -6.93861,-10l0,7.94118z" opacity="undefined" fill="#000000"/>
              <path stroke="#ffffff" id="svg_9" d="m6.5725,85c0,-5.43379 3.16831,-10 6.93861,-10l72.97778,0c3.77029,0 6.93861,4.56621 6.93861,10l0,-7.94118c0,5.43379 -3.16832,10 -6.93861,10l-72.97778,0c-3.7703,0 -6.93861,-4.56621 -6.93861,-10l0,7.94118z" opacity="undefined" fill="#000000"/>
            </g>
          </svg>
          <h2>{selectedUsername ? selectedUsername : 'Select a user or add a new user'}</h2>
        </div>
        </div>  
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
        <form onSubmit={handleSendMessageClick}>
            <input
              className="send-textbox"
              type="text"
              placeholder="New Message"
              value={newMessage}
              onChange={handleInputChange}
            />
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
      </div>
      
    </div>
  );
}

export default Chat;
