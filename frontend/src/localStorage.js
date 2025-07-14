export function setStorage(token, privateKey, userId, publicKey) {
  localStorage.setItem("token", token);
  localStorage.setItem("privateKey", privateKey);
  localStorage.setItem("userId", userId);
  localStorage.setItem("publicKey", publicKey);
}

export function removeStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("privateKey");
  localStorage.removeItem("userId");
  localStorage.removeItem("publicKey");
}
