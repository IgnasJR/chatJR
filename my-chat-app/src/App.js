/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Login from "./Login";
import Chat from "./Chat";
import io from "socket.io-client";
import crypto from "./crypto";
import { handleSendMessage } from "./messageHandler";

let loadedLastMessage = false;

function App() {
  let [private_key, setPrivateKey] = useState("");
  let [public_key, setPublicKey] = useState("");
  let [currentUserId, setCurrentUserId] = useState();
  const [conversations, setConversations] = useState([]);
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const handleSetPrivacy = () => {
    setPrivacy(!privacy);
    loadedLastMessage = false;
  };
  const handleUserSelection = (userId, key) => {
    if (userId === selectedUser) return;
    setMessages([]);
    loadedLastMessage = false;
    setPublicKey(key);
    setSelectedUser(userId);
    fetchMessages();
  };
  const [isLoading, setIsLoading] = useState(false);

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
          console.log("Message received:", messageContent);
          if (currentUserId === messageContent.sender_id) return;
          if (messageContent.isPrivate) {
            messageContent.message_content = crypto.decryptMessage(
              messageContent.message_content,
              private_key
            );
          }

          setMessages((prevMessages) => [...prevMessages, messageContent]);
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

  const fetchMessages = async () => {
    if (loadedLastMessage) return;
    setIsLoading(true);
    try {
      if (selectedUser) {
        let url = `${window.location.protocol}//${window.location.hostname}:3001/api/messages/${selectedUser}`;

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
            loadedLastMessage = true;
            console.log(
              "No messages have been received, last message is ",
              messages[0].message_id
            );
          }
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setIsLoading(false);
  };

  const SendSocketMessage = async () => {
    let message = {
      token: token,
      conversationId: selectedUser,
      sender_id: null,
      message_content: privacy
        ? crypto.encryptMessage(newMessage, public_key)
        : newMessage,
      created_at: null,
      isPrivate: privacy,
    };

    socket.emit("message", message);
    message = {
      ...message,
      message_content: newMessage,
      sender_id: currentUserId,
    };
    console.log("Message sent:", message);
    messages.push(message);
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
          setPrivacy={setPrivacy}
          privacy={privacy}
          handleSetPrivacy={handleSetPrivacy}
          SendSocketMessage={SendSocketMessage}
          public_key={public_key}
        />
      ) : (
        <Login
          handleLogin
          setToken={setToken}
          setCurrentUserId={setCurrentUserId}
          setPrivateKey={setPrivateKey}
          setPublicKey={setPublicKey}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          hashPassword={crypto.hashPassword}
        />
      )}
    </div>
  );
}

export default App;
