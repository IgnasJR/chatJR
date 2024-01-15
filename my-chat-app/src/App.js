/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Login from "./Login";
import Chat from "./Chat";
import io from "socket.io-client";
import crypto from "./crypto";
import { handleSendMessage } from "./messageHandler";
import serverOptions from "./serverSettings";
import Cookies from "js-cookie";

let loadedLastMessage = false;

function App() {
  const [private_key, setPrivateKey] = useState(Cookies.get("privateKey"));
  const [public_key, setPublicKey] = useState("");
  const [currentUserId, setCurrentUserId] = useState(
    parseInt(Cookies.get("userId"))
  );
  const [conversations, setConversations] = useState([]);
  const [token, setToken] = useState(Cookies.get("token"));
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [errorMessage, updateErrorMessage] = useState({
    errorStatus: false,
    message: null,
  });
  const [privacy, setPrivacy] = useState(false);
  const handleSetPrivacy = () => {
    setPrivacy(!privacy);
    loadedLastMessage = false;
  };
  const handleUserSelection = (userId, key) => {
    setMessages([]);
    loadedLastMessage = false;
    setPublicKey(key);
    setSelectedUser(userId);
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
        serverOptions.isDevelopment
          ? serverOptions.socketUrl
          : `${window.location.protocol}//${window.location.hostname}:8080/`,
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
      if (selectedUser) {
        fetchMessages(selectedUser);
      }
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [token, selectedUser, messages]);

  const setCookie = (token, privateKey, userId) => {
    Cookies.set("token", token, { expires: 7, secure: false });
    Cookies.set("privateKey", privateKey, { expires: 7, secure: false });
    Cookies.set("userId", userId, { expires: 7, secure: false });
  };
  const removeCookie = () => {
    Cookies.remove("token");
    Cookies.remove("privateKey");
    Cookies.remove("userId");
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        serverOptions.isDevelopment
          ? serverOptions.backUrl + `/api/conversations`
          : `${window.location.protocol}//${window.location.hostname}:3001/api/conversations`,
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
    if (
      conversations.some(
        (conversation) => conversation.username === newUserInput
      )
    ) {
      setIsLoading(false);
      errorHandling("Conversation already exists");
      return;
    }
    try {
      const response = await fetch(
        serverOptions.isDevelopment
          ? serverOptions.backUrl + `/api/conversations`
          : `${window.location.protocol}//${window.location.hostname}:3001/api/conversations`,
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
        let url = serverOptions.isDevelopment
          ? serverOptions.backUrl + `/api/messages/${selectedUser}`
          : `${window.location.protocol}//${window.location.hostname}:3001/api/messages/${selectedUser}`;

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
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const errorHandling = (error) => {
    switch (error) {
      case "Failed to fetch":
        updateErrorMessage({
          message: "Unable to reach the server",
          errorStatus: true,
        });
        break;

      default:
        updateErrorMessage({ message: error, errorStatus: true });
        break;
    }
    setTimeout(() => {
      updateErrorMessage({ message: null, errorStatus: false });
    }, 3000);
  };

  return (
    <div className="container">
      {isLoading ? (
        <span
          className="loader"
          style={{ position: "absolute", top: "50%", left: "50%" }}
        ></span>
      ) : null}
      {errorMessage.errorStatus ? (
        <span className="error-message-red">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ paddingRight: "1em", width: "1.5em" }}
            viewBox="0 0 512 512"
          >
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
          </svg>
          <p>{errorMessage.message}</p>
        </span>
      ) : null}
      {token ? (
        <Chat
          currentUserId={currentUserId}
          token={token}
          conversations={conversations}
          messages={messages}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          handleAddConversation={handleAddConversation}
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
          errorHandling={errorHandling}
          errorMessage={errorMessage}
          serverOptions={serverOptions}
          removeCookie={removeCookie}
          setMessages={setMessages}
        />
      ) : (
        <Login
          handleLogin
          setToken={setToken}
          setCurrentUserId={setCurrentUserId}
          setPrivateKey={setPrivateKey}
          setPublicKey={setPublicKey}
          setIsLoading={setIsLoading}
          hashPassword={crypto.hashPassword}
          errorHandling={errorHandling}
          serverOptions={serverOptions}
          setCookie={setCookie}
        />
      )}
    </div>
  );
}

export default App;
