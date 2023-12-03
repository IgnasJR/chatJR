import React, { useState } from 'react';
import Modal from 'react-modal';
import forge from 'node-forge';
let CryptoJS = require('crypto-js');

const RegisterForm = ({ isOpen, onClose }) => {
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      // Generating RSA key pair
      let keyPair = forge.pki.rsa.generateKeyPair(2048);
      let publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
      let privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);
      //publicKey = publicKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\r\n/g, '');

      // Hashing the username to use as a salt, then hashing the password with the salt
      let algo = CryptoJS.algo.SHA256.create();
      algo.update(password, 'utf-8');
      algo.update(CryptoJS.SHA256(username), 'utf-8');
      password = algo.finalize().toString(CryptoJS.enc.Base64);
      //console.log(password);

      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, publicKey }),
      });

      const data = await response.json();
      if (response.ok) {
        //localStorage.setItem('privateKey', privateKey);
        onClose();
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Modal className={'register'} isOpen={isOpen} onRequestClose={onClose}>
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
        <button onClick={handleRegister} className="form-button-green">
          Register
        </button>
        <button onClick={onClose} className="form-button-red">
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default RegisterForm;
