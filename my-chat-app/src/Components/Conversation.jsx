import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import crypto from "../crypto";
import { handleSendMessage } from "../messageHandler";

let loadedLastMessage = false;
const Conversation = ({
  token,
  selectedUser,
  sidebarOpen,
  messageEl,
  lastMessageRef,
  currentUserId,
  handleInputChange,
  setIsLoading,
  aesKey,
  errorHandling,
}) => {
  const messageEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const observer = useRef();
  let isObserving = false;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (token) {
      let newSocket = io(process.env.REACT_APP_SOCKET_URL || "/", {
        transports: ["websocket"],
      });

      setSocket(newSocket);
      console.log("Succesfully connected to a socket");
      if (selectedUser) {
        socket.emit("authenticate", {
          token: token,
          conversationId: selectedUser.conversation_id,
        });
        socket.on("message", function (messageContent) {
          console.log("Message received:", messageContent);
          if (currentUserId === messageContent.sender_id) return;
          messageContent.message_content = crypto.decryptMessage(
            messageContent.message_content,
            aesKey
          );
          console.log("Decrypted message: ", messageContent);

          setMessages((prevMessages) => [...prevMessages, messageContent]);
        });
      }
      if (selectedUser) {
        fetchMessages(selectedUser);
      }
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [selectedUser]);

  const handleSendMessageClick = async (e) => {
    e.preventDefault();
    const message = newMessage;
    try {
      handleSendMessage(
        message,
        selectedUser,
        token,
        socket,
        aesKey,
        currentUserId,
        setMessages
      );
      setNewMessage("");
    } catch (error) {
      errorHandling(error.message);
    }
  };

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchMessages = async () => {
    if (loadedLastMessage) return;
    setIsLoading(true);
    try {
      if (selectedUser) {
        let url = `/api/messages/${selectedUser.conversation_id}`;

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
            data.forEach((message) => {
              message.message_content = crypto.decryptMessage(
                message.message_content,
                aesKey
              );
            });
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

  const handleIntersection = (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && isObserving) {
      fetchMessages();
    } else {
      isObserving = true;
    }
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

  handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  useEffect(() => {
    observeLastMessage();
  }, [messages]);

  return (
    <div>
      <div className="message-container" ref={messageEl}>
        <ul
          className={`message-list ${
            sidebarOpen ? "open-chat" : "closed-chat"
          }`}
        >
          {messages.map((message, index) => (
            <li key={message.message_id} className="message-item">
              <div
                className="message-sender"
                ref={index === 0 ? lastMessageRef : null}
              >
                {message.sender_name}
              </div>
              <div
                className={`message-content ${
                  message.sender_id === currentUserId
                    ? "self-message self-public-message"
                    : "other-message other-public-message"
                }`}
              >
                {message.message_content}
              </div>
            </li>
          ))}
          <div ref={messageEndRef} />
        </ul>
      </div>
      <div
        className={`input-container ${
          sidebarOpen ? "open-chat" : "closed-chat"
        }`}
      >
        <form onSubmit={handleSendMessageClick}>
          <input
            className="send-textbox"
            type="text"
            placeholder="New Message"
            value={newMessage}
            onChange={handleInputChange}
          />
          <button type="submit" className="send-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 512 512"
            >
              <path d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;
