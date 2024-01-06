import React, { useState, useEffect, useRef } from 'react';

function Chat({
  currentUserId,
  conversations,
  messages,
  handleUserSelection,
  handleAddConversation,
  newMessage,
  handleSendMessage,
  fetchMessages,
  privacy,
  handleSetPrivacy,
  token,
  public_key,
  selectedUser,
  setNewMessage,
  SendSocketMessage,
  errorHandling,
  serverOptions
}) {
  const observer = useRef();
  let isObserving = false;
  const lastMessageRef = useRef();
  const messageEl = useRef(null);
  const [newUserInput, setNewUserInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedUsername, setUsername] = useState('');
  const [hoveredElement, setHoveredElement] = useState(null);

  useEffect(() => {
    if (messageEl) {
      messageEl.current.addEventListener('DOMNodeInserted', event => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
    observeLastMessage();
  },[messages])

  const handleDeleteConversation = async (conversationId) => {
    try {
    const response = await fetch(
      (serverOptions.isDevelopment?serverOptions.backUrl + `/api/conversations`: `${window.location.protocol}//${window.location.hostname}:3001/api/conversations`),
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
        }),
      }
    );
    if (response.ok) {
      conversations = conversations.filter((conversation) => conversation.conversation_id !== conversationId);
      setNewUserInput('');
      messages = [];
    }
  }
  catch (error) {
    errorHandling(error.message);
  }
  };

  const handleMouseEnter = (conversationId) => {
    setHoveredElement(conversationId);
  };
  const handleMouseLeave = () => {
    setHoveredElement(null);
  };
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleTogglePrivate = () => {
    handleSetPrivacy();
  };
  const handleIntersection = (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && isObserving) {
      fetchMessages();
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

    const handleSendMessageClick = async (e) => {
      e.preventDefault();
      const message = newMessage;
      try{
        handleSendMessage(privacy, message, public_key, selectedUser, token, SendSocketMessage, errorHandling);
        setNewMessage('');
      }
      catch (error) {
        errorHandling(error.message);
      }
    };
    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };
    const logOut = () => {
      window.location.reload();
    };

  return (
    <div className={`chat-container`} style={{ position: 'relative' }}>
      <div className={`msg-header`}>
        <div className="header-content">
          <h2 style={{paddingLeft:'1em', cursor:'pointer'}} onClick={toggleSidebar}>☰</h2>
          <h2 style={{paddingLeft:'1em'}}>{selectedUsername ? selectedUsername : 'Select a conversation'}</h2>
            <div style={{position:'absolute', right:'4em', cursor:'pointer'}} data-tooltip="Toggle secret chat mode" data-tooltip-position="bottom">
              {selectedUsername !== '' ? <svg onClick={handleTogglePrivate} className='privacy-button' xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -50 512 560"><path d={privacy ? "M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" : "M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144v48H64c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64H144V144z"} fill={privacy ? "gold" : "white"} /> </svg>: null}
            </div>
            <svg onClick={logOut} style={{marginLeft: "auto", paddingRight:'1em', cursor:'pointer'}} xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -50 512 512"><path fill="white" d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"/></svg>
        </div>
      </div>  
      <div className={`message-container`}>
      <div className={`sidebar ${sidebarOpen ? 'open-sidebar' : 'closed-sidebar'}`}>
        <ul className="user-list">
          {conversations.map((conversation) => (
            <li className='user-item'
              key={conversation.id}
              onMouseEnter={() => handleMouseEnter(conversation.conversation_id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => {
                handleUserSelection(conversation.conversation_id, conversation.public_key);
                setUsername(conversation.username);
              }}>
              {conversation.username}
              {hoveredElement === conversation.conversation_id ? <svg onClick={() => handleDeleteConversation(conversation.conversation_id)} style={{cursor:'pointer'}} fill="white" xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 576 512"><path d="M576 128c0-35.3-28.7-64-64-64H205.3c-17 0-33.3 6.7-45.3 18.7L9.4 233.4c-6 6-9.4 14.1-9.4 22.6s3.4 16.6 9.4 22.6L160 429.3c12 12 28.3 18.7 45.3 18.7H512c35.3 0 64-28.7 64-64V128zM271 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>: null}
            </li>
          ))}
        </ul>
        <div className="add-user-container">
          <input
            type="text"
            placeholder="New User"
            className="form-input-user-add"
            value={newUserInput}
            onChange={(e) => setNewUserInput(e.target.value)}
          />
          <button
            onClick={() => handleAddConversation(newUserInput)}
            className="form-button-user-add"
            style={{cursor:'pointer'}}
          > Add User</button>
        </div>
      </div>
        <ul className={`message-list ${sidebarOpen ? 'open-chat' : 'closed-chat'}`} ref={messageEl}>
          {messages.map((message, index) => (
            <li key={message.message_id} className={`message-item `}>
            <div className="message-sender" ref={index === 0 ? lastMessageRef : null}>{message.sender_name}</div>
            <div className={`message-content ${message.sender_id === currentUserId ? !message.isPrivate ? 'self-message self-public-message' : 'self-message self-private-message' : !message.isPrivate ? 'other-message other-public-message' : 'other-message other-private-message'}`}>
              {message.message_content}
              
            </div>
          </li>
          ))}
        </ul>
      </div>
      <div className={`input-container ${sidebarOpen ? 'open-chat' : 'closed-chat'}`}>
        <form onSubmit={handleSendMessageClick}>
            <input
              className="send-textbox"
              type="text"
              placeholder="New Message"
              value={newMessage}
              onChange={handleInputChange}
            />
            <button type="submit" className="send-button"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 512 512"><path d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z"/></svg></button>
          </form>
        </div>
    </div>
  );
}

export default Chat;
