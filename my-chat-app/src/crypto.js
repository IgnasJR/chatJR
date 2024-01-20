import CryptoJS, { AES } from "crypto-js";
import forge from "node-forge";

const hashPassword = (username, password) => {
  console.log(username, password);
  var algo = CryptoJS.algo.SHA256.create();
  algo.update(password, "utf-8");
  algo.update(CryptoJS.SHA256(username), "utf-8");
  return algo.finalize().toString(CryptoJS.enc.Base64);
};

const encryptMessage = (message, publicKey) => {
  console.log("Encrypting message ", message, " with public key: ", publicKey);
  console.log(message, publicKey);
  const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
  const encrypted = forge.util.encode64(
    publicKeyObj.encrypt(message, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    })
  );
  return encrypted;
};

const decryptMessage = (message, privateKey) => {
  console.log("Private key: ", privateKey);

  const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
  const decrypted = privateKeyObj.decrypt(
    forge.util.decode64(message),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create(),
    }
  );
  return decrypted;
};
const decryptPrivateKey = (privateKey, password) => {
  try {
    const decryptedPrivateKey = CryptoJS.AES.decrypt(
      privateKey,
      password
    ).toString(CryptoJS.enc.Utf8);
    return decryptedPrivateKey;
  } catch (error) {
    return Error("Unable to decrypt password");
  }
};

const generateAESkey = () => {
  const randomKey = CryptoJS.lib.WordArray.random(32);
  const hexKey = randomKey.toString(CryptoJS.enc.Hex);
  return hexKey;
};

const crypto = {
  hashPassword,
  encryptMessage,
  decryptMessage,
  decryptPrivateKey,
  generateAESkey,
};
export default crypto;
