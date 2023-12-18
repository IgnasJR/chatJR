import CryptoJS from "crypto-js";
import forge from "node-forge";

const hashPassword = (username, password) => {
  console.log(username, password);
  var algo = CryptoJS.algo.SHA256.create();
  algo.update(password, "utf-8");
  algo.update(CryptoJS.SHA256(username), "utf-8");
  return algo.finalize().toString(CryptoJS.enc.Base64);
};

const encryptMessage = (message, publicKey) => {
  const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
  const encrypted = forge.util.encode64(
    publicKeyObj.encrypt(message, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    })
  );
  return encrypted;
};

const decryptMessage = (message, privateKey) => {
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

const crypto = { hashPassword, encryptMessage, decryptMessage };
export default crypto;
