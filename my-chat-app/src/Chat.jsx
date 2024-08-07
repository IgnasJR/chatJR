import React, { useState, useEffect, useRef } from 'react';
import Header from "./Components/Header"
import Sidebar from "./Components/Sidebar"
import Conversation from "./Components/Conversation"

function Chat({
  currentUserId,
  conversations,
  messages,
  handleUserSelection,
  handleAddConversation,
  newMessage,
  handleSendMessage,
  fetchMessages,
  token,
  selectedUser,
  setNewMessage,
  SendSocketMessage,
  errorHandling,
  serverOptions,
  removeCookie,
  aesKey,
  crypto
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
  })

  const handleDeleteConversation = async (conversationId) => {
    try {
      const response = await fetch(
        (serverOptions.isDevelopment ? serverOptions.backUrl + `/api/conversations` : `${window.location.protocol}//${window.location.hostname}:3001/api/conversations`),
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
        if (conversations.username === selectedUsername) {
          setUsername('');
        }
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
    try {
      handleSendMessage(message, selectedUser, token, SendSocketMessage, aesKey);
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
    removeCookie();
    window.location.reload();
  };

  return (
    <div style={{width:"100%"}}>
      <Header selectedUsername={selectedUsername} toggleSidebar={toggleSidebar} logOut={logOut}/>
      <div>
        <Sidebar 
            sidebarOpen={sidebarOpen} 
            conversations={conversations} 
            handleMouseEnter={handleMouseEnter} 
            handleMouseLeave={handleMouseLeave} 
            handleUserSelection={handleUserSelection} 
            setUsername={setUsername} 
            handleDeleteConversation={handleDeleteConversation} 
            hoveredElement={hoveredElement} 
            newUserInput={newUserInput} 
            setNewUserInput={setNewUserInput} 
            handleAddConversation={handleAddConversation}
        />
        <Conversation sidebarOpen={sidebarOpen} handleSendMessageClick={handleSendMessageClick} messageEl={messageEl} lastMessageRef={lastMessageRef} currentUserId={currentUserId} messages={messages} newMessage={newMessage} handleInputChange={handleInputChange} />
      </div>  
    </div>
    
  );
}

export default Chat;
