import crypto from "./crypto";

export const handleSendMessage = async (
  message,
  selectedUser,
  token,
  SendSocketMessage,
  aesKey
) => {
  if (message === "") return;
  try {
    if (!selectedUser) {
      throw new Error("No conversation selected");
    }
    const response = await fetch(`/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId: selectedUser,
        messageContent: crypto.encryptMessage(message, aesKey),
      }),
    });
    if (response.ok) {
      SendSocketMessage();
    }
  } catch (error) {
    console.error(error);
  }
};
