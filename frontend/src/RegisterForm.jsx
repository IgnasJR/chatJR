import React, { useState } from "react";
import Modal from "react-modal";
import forge from "node-forge";
let CryptoJS = require("crypto-js");

const RegisterForm = ({ isOpen, onClose, errorHandling, setIsLoading }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    setIsLoading(true);
    if (!username || !password) return;

    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);

    const encryptedPrivateKey = CryptoJS.AES.encrypt(
      privateKey,
      password
    ).toString();

    let algo = CryptoJS.algo.SHA256.create();
    algo.update(password, "utf-8");
    algo.update(CryptoJS.SHA256(username), "utf-8");
    const hashedPassword = algo.finalize().toString(CryptoJS.enc.Base64);
    setPassword(hashedPassword);
    console.log("hashed password", hashedPassword);

    try {
      const response = fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password: hashedPassword,
          publicKey,
          privateKey: encryptedPrivateKey,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        errorHandling("Registration successful");
        close();
      } else {
        throw new Error(data.error);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error.message);
      errorHandling(error.message);
      close();
    }
    setIsLoading(false);
  };

  const close = () => {
    onClose(false);
  };

  return (
    <Modal className={"register"} isOpen={isOpen} onRequestClose={onClose}>
      <div className="register-form">
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input-register"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input-register"
        />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={handleRegister} className="form-button-green">
            Register
          </button>
          <button onClick={close} className="form-button-red">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RegisterForm;
