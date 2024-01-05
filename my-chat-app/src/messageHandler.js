import crypto from "./crypto";
import serverOptions from "./serverSettings";

export const handleSendMessage = async (
  privacy,
  newMessage,
  public_key,
  selectedUser,
  token,
  setNewMessage,
  SendSocketMessage
) => {
  if (newMessage === "") return;
  if (privacy) {
    const encryptedMessage = crypto.encryptMessage(newMessage, public_key);
    SendSocketMessage(encryptedMessage);
    setNewMessage("");
    return;
  }
  try {
    if (!selectedUser) {
      throw new Error("No conversation selected");
    }
    const response = await fetch(
      serverOptions.isDevelopment
        ? serverOptions.backUrl + `/api/messages`
        : `${window.location.protocol}//${window.location.hostname}:3001/api/messages`,
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
