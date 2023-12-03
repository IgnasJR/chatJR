import React, { useState, useEffect, useRef } from 'react';

function Chat({
  currentUserId,
  conversations,
  messages,
  handleUserSelection,
  handleAddConversation,
  handleInputChange,
  newMessage,
  handleSendMessage,
}) {
  
  const messageEl = useRef(null);
  const [newUserInput, setNewUserInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedUsername, setUsername] = useState('');

  useEffect(() => {
    if (messageEl) {
      messageEl.current.addEventListener('DOMNodeInserted', event => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
  })

    const handleSendMessageClick = (e) => {
      e.preventDefault();
      handleSendMessage();
    };
    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };

  return (
    <div className={`chat-container`}>
      <div className={`sidebar ${sidebarOpen ? 'open-sidebar' : 'closed-sidebar'}`}>
        <h2>Users:</h2>
        <ul className="user-list">
          {conversations.map((conversation) => (
            <li className='user-item'
              key={conversation.id}
              onClick={() => {
                handleUserSelection(conversation.conversation_id);
                setUsername(conversation.username);
              }}
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
          <h2 style={{padding: '3px'}} onClick={toggleSidebar}>☰</h2>
          <h2>{selectedUsername ? selectedUsername : 'Select a user or add a new user'}</h2>
        </div>
        </div>  
        <ul className="message-list" ref={messageEl}>
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
            <button type="submit" className="send-button">»</button>
          </form>
        </div>
      </div>
      
    </div>
  );
}

export default Chat;
