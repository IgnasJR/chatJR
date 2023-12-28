import crypto from "./crypto";

export const handleSendMessage = async (
  privacy,
  newMessage,
  public_key,
  selectedUser,
  token,
  setNewMessage,
  SendSocketMessage
) => {
  if (privacy) {
    const encryptedMessage = crypto.encryptMessage(newMessage, public_key);
    SendSocketMessage(encryptedMessage);
    setNewMessage("");
    return;
  }
  try {
    if (!selectedUser) {
      throw new Error("No conversation selected");
    } else if (newMessage === "") {
      throw new Error("No message to send");
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
    if (response.ok) {
      SendSocketMessage();
      setNewMessage("");
    }
  } catch (error) {
    console.error(error);
  }
};
