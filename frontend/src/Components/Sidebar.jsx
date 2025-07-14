import { useEffect, useState } from "react";
import crypto from "../crypto";

const Sidebar = ({
  sidebarOpen,
  setSelectedUser,
  setIsLoading,
  token,
  public_key,
  errorHandling,
}) => {
  const [conversations, setConversations] = useState([]);
  const [newUserInput, setNewUserInput] = useState("");

  const [hoveredElement, setHoveredElement] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
    fetchData();
  }, [setIsLoading, token]);

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
        setConversations(
          conversations.filter(
            (conversation) => conversation.conversation_id !== conversationId
          )
        );
        setNewUserInput("");
      }
    } catch (error) {
      errorHandling(error.message);
    }
  };

  const handleAddConversation = async (newUserInput) => {
    setIsLoading(true);
    let aesKey = crypto.generateAESkey();
    let otherPublicKey;
    try {
      const response = await fetch(`/api/getPublicKey/${newUserInput}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        otherPublicKey = data;
      } else {
        throw new Error("Unable to fetch user");
      }
    } catch (error) {
      // errorHandling("Unable to fetch user");
      setIsLoading(false);
      return;
    }

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
      const response = await fetch(`/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          username: newUserInput,
          firstKey: crypto.encryptKey(aesKey, public_key),
          secondKey: crypto.encryptKey(aesKey, otherPublicKey.public_key),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setConversations([
          ...conversations,
          {
            conversation_id: data.conversationId,
            user_id: newUserInput,
            username: newUserInput,
            key: aesKey,
          },
        ]);
        setSelectedUser();
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };

  return (
    <div
      className={`sidebar ${sidebarOpen ? "open-sidebar" : "closed-sidebar"}`}
    >
      <ul className="user-list">
        {conversations.map((conversation) => (
          <li
            className="user-item"
            key={conversation.id}
            onClick={() => {
              setSelectedUser(conversation);
            }}
            onMouseEnter={() => setHoveredElement(conversation.conversation_id)}
            onMouseLeave={() => setHoveredElement(null)}
          >
            {conversation.username}
            {hoveredElement === conversation.conversation_id ? (
              <svg
                onClick={() =>
                  handleDeleteConversation(conversation.conversation_id)
                }
                style={{ cursor: "pointer" }}
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
                height="16"
                width="18"
                viewBox="0 0 576 512"
              >
                <path d="M576 128c0-35.3-28.7-64-64-64H205.3c-17 0-33.3 6.7-45.3 18.7L9.4 233.4c-6 6-9.4 14.1-9.4 22.6s3.4 16.6 9.4 22.6L160 429.3c12 12 28.3 18.7 45.3 18.7H512c35.3 0 64-28.7 64-64V128zM271 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" />
              </svg>
            ) : null}
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
          style={{ cursor: "pointer" }}
        >
          {" "}
          Add User
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
