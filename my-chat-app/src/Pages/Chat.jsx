import React, { useState, useRef, useEffect } from "react";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import Conversation from "../Components/Conversation";
import crypto from "../crypto";

function Chat({
  currentUserId,
  conversations,
  messages,
  handleAddConversation,
  token,
  errorHandling,
  setIsLoading,
  private_key,
}) {
  const lastMessageRef = useRef();
  const messageEl = useRef(null);
  const [newUserInput, setNewUserInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [aesKey, setAesKey] = useState("");

  function setUser(user) {
    setSelectedUser(user);
    setAesKey(crypto.decryptKey(user.user_key, private_key));
  }

  const handleDeleteConversation = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
        }),
      });
      if (response.ok) {
        conversations = conversations.filter(
          (conversation) => conversation.conversation_id !== conversationId
        );
        setNewUserInput("");
        messages = [];
      }
    } catch (error) {
      errorHandling(error.message);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ width: "100%" }}>
      <Header selectedUser={selectedUser} toggleSidebar={toggleSidebar} />
      <div>
        <Sidebar
          sidebarOpen={sidebarOpen}
          conversations={conversations}
          setSelectedUser={setUser}
          handleDeleteConversation={handleDeleteConversation}
          hoveredElement={hoveredElement}
          newUserInput={newUserInput}
          handleAddConversation={handleAddConversation}
          setIsLoading={setIsLoading}
          token={token}
        />
        <Conversation
          token={token}
          aesKey={aesKey}
          sidebarOpen={sidebarOpen}
          messageEl={messageEl}
          lastMessageRef={lastMessageRef}
          currentUserId={currentUserId}
          messages={messages}
          setIsLoading={setIsLoading}
          selectedUser={selectedUser}
          errorHandling={errorHandling}
        />
      </div>
    </div>
  );
}

export default Chat;
