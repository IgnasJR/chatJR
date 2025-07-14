import React, { useState } from "react";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import Conversation from "../Components/Conversation";
import crypto from "../crypto";

function Chat({
  currentUserId,
  token,
  errorHandling,
  setIsLoading,
  private_key,
  public_key,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [aesKey, setAesKey] = useState("");

  function setUser(user) {
    if (selectedUser === user || !user) return;
    setSelectedUser(user);
    setAesKey(crypto.decryptKey(user.user_key, private_key));
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ width: "100%" }}>
      <Header selectedUser={selectedUser} toggleSidebar={toggleSidebar} />
      <div>
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSelectedUser={setUser}
          setIsLoading={setIsLoading}
          token={token}
          public_key={public_key}
        />
        <Conversation
          token={token}
          aesKey={aesKey}
          sidebarOpen={sidebarOpen}
          currentUserId={currentUserId}
          setIsLoading={setIsLoading}
          selectedUser={selectedUser}
          errorHandling={errorHandling}
        />
      </div>
    </div>
  );
}

export default Chat;
