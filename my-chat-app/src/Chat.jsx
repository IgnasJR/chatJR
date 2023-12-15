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
  fetchMessages,
  isLoading,
  privacy,
  handleSetPrivacy,
}) {
  const observer = useRef();
  let isObserving = false;
  const lastMessageRef = useRef();
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
    observeLastMessage();
  })

  const handleTogglePrivate = () => {
    handleSetPrivacy();
  };

  const handleIntersection = (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && isObserving) {
      fetchMessages(messages[0].message_id);
      console.log(messages[0].message_id);
    }
    else isObserving = true;
  };

  const observeLastMessage = () => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(handleIntersection);
    if (lastMessageRef.current) {
      observer.current.observe(lastMessageRef.current);
    }
  };

    const handleSendMessageClick = (e) => {
      e.preventDefault();
      handleSendMessage();
    };
    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };
    const logOut = () => {
      window.location.reload();
    };

  return (
    <div className={`chat-container`} style={{ position: 'relative' }}>
      {isLoading ? <span className="loader" style={{ position: 'absolute', top: '50%', left: '50%' }}></span> : null}
      <div className={`sidebar ${sidebarOpen ? 'open-sidebar' : 'closed-sidebar'}`}>
        <h2 style={{paddingLeft:"0.5 em"}}>Users:</h2>
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
            style={{cursor:'pointer'}}
          >
            Add User
          </button>
        </div>
      </div>
      <div className={`message-container ${sidebarOpen ? 'open-chat' : 'closed-chat'}`}>
            <div className={`msg-header ${sidebarOpen ? 'open-msg-header' : 'closed-msg-header'}`}>
              <div className="header-content">
                <h2 style={{padding: '3px', cursor:'pointer'}} onClick={toggleSidebar}>☰</h2>
                <h2>{selectedUsername ? selectedUsername : 'Select a user or add a new user'}</h2>
                {selectedUsername !== '' ? <svg onClick={handleTogglePrivate} style={{paddingLeft:"1em", cursor:'pointer'}} xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -50 512 560"><path d={privacy ? "M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" : "M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144v48H64c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64H144V144z"} fill={privacy ? "gold" : "white"} /></svg>: null}
                <svg onClick={logOut} style={{marginLeft: "auto", paddingRight:"10px", cursor:'pointer'}} xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -50 512 512"><path fill="white" d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"/></svg>
              </div>
            </div>  
        <ul className="message-list" ref={messageEl}>
          {messages.map((message, index) => (
            <li key={message.message_id} className={`message-item `}>
            <div className="message-sender" ref={index === 0 ? lastMessageRef : null}>{message.sender_name}</div>
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
