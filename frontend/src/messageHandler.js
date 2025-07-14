import crypto from "./crypto";

const SendSocketMessage = async (
  socket,
  token,
  selectedUser,
  encryptedMessage,
  currentUserId,
  originalMessage,
  setMessages
) => {
  let message = {
    token: token,
    conversationId: selectedUser.conversation_id,
    sender_id: null,
    message_content: encryptedMessage,
    created_at: Date.now(),
  };

  socket.emit("message", message);
  message = {
    ...message,
    message_content: originalMessage,
    sender_id: currentUserId,
  };
  console.log("Message sent:", message);
  setMessages((prevMessages) => [...prevMessages, message]);
};

export const handleSendMessage = async (
  message,
  selectedUser,
  token,
  socket,
  aesKey,
  currentUserId,
  setMessages
) => {
  if (message === "") return;
  try {
    if (!selectedUser) {
      throw new Error("No conversation selected");
    }
    const encryptedMessage = crypto.encryptMessage(message, aesKey);
    const response = await fetch(`/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId: selectedUser.conversation_id,
        messageContent: encryptedMessage,
      }),
    });
    if (response.ok) {
      SendSocketMessage(
        socket,
        token,
        selectedUser,
        encryptedMessage,
        currentUserId,
        message,
        setMessages
      );
    }
  } catch (error) {
    console.error(error);
  }
};
