/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Login from "./Login";
import Chat from "./Chat";
import io from "socket.io-client";
import CryptoJS from "crypto-js";

function App() {
  let [currentUserId, setCurrentUserId] = useState();
  const [conversations, setConversations] = useState([]);
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const handleUserSelection = (userId) => {
    setMessages([]);
    setSelectedUser(userId);
  };
  const [isLoading, setIsLoading] = useState(true);

  const connectionOptions = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      let newSocket = io.connect(
        `${window.location.protocol}//${window.location.hostname}:8080/`,
        connectionOptions
      ); // Set the socket state
      setSocket(newSocket);
      console.log("Succesfully connected to a socket");
      if (selectedUser) {
        socket.emit("authenticate", {
          token: token,
          conversationId: selectedUser,
        });
        socket.on("message", function (messageContent) {
          setMessages((prevMessages) => [...prevMessages, messageContent]);
          console.log("Updated Messages:", messages);
        });
      }
      fetchConversations();
      fetchMessages(selectedUser);
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [token, selectedUser]);

  let handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${window.location.protocol}//${window.location.hostname}:3001/api/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setConversations(data);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };

  const handleAddConversation = async (newUserInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${window.location.protocol}//${window.location.hostname}:3001/api/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: newUserInput }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setConversations([
          ...conversations,
          {
            conversation_id: data.conversationId,
            user_id: newUserInput,
            username: newUserInput,
          },
        ]);
        setSelectedUser("");
        fetchConversations();
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };

  const fetchMessages = async (recipientId) => {
    setIsLoading(true);
    try {
      if (recipientId) {
        let url = `${window.location.protocol}//${window.location.hostname}:3001/api/messages/${recipientId}`;

        if (messages.length > 0) {
          url += `?lastMessageId=${messages[0].message_id}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          if (data.length > 0) {
            setMessages((prevMessages) => [...data, ...prevMessages]);
          } else {
            console.log("No messages have been received");
          }
        } else {
          console.error("Error:", data.error);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    try {
      if (!selectedUser) {
        console.error("No conversation selected");
        return;
      } else if (newMessage === "") {
        console.error("No message to send");
        return;
      }
      const response = await fetch(
        `${window.location.protocol}//${window.location.hostname}:3001/api/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId: selectedUser,
            messageContent: newMessage,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        socket.emit("message", {
          token: token,
          message_id: data,
          conversationId: selectedUser,
          sender_id: null,
          message_Content: newMessage,
          creted_at: null,
        });

        setNewMessage("");
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogin = async (username, password) => {
    setIsLoading(true);
    var algo = CryptoJS.algo.SHA256.create();
    algo.update(password, "utf-8");
    algo.update(CryptoJS.SHA256(username), "utf-8");
    var hash = algo.finalize().toString(CryptoJS.enc.Base64);
    console.log(hash);

    try {
      const response = await fetch(
        `${window.location.protocol}//${window.location.hostname}:3001/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password: hash }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setCurrentUserId(data.userId);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container">
      {token ? (
        <Chat
          currentUserId={currentUserId}
          token={token}
          conversations={conversations}
          messages={messages}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          handleAddConversation={handleAddConversation}
          handleInputChange={handleInputChange}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleUserSelection={handleUserSelection}
          fetchMessages={fetchMessages}
          isLoading={isLoading}
        />
      ) : (
        <Login handleLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
