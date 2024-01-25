import crypto from "./crypto";
import serverOptions from "./serverSettings";

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
          messageContent: crypto.encryptMessage(message, aesKey),
        }),
      }
    );
    if (response.ok) {
      SendSocketMessage();
    }
  } catch (error) {
    console.error(error);
  }
};
