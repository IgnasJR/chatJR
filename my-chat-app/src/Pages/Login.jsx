import React, { useState } from "react";
import RegisterForm from "../RegisterForm";
import crypto from "../crypto";

function Login({
  setIsLoading,
  hashPassword,
  errorHandling,
  serverOptions,
  setCookie,
  setPublicKey,
}) {
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleInputChange = (e) => {
    if (e.target.name === "username") {
      setUsername(e.target.value);
    } else if (e.target.name === "password") {
      setPassword(e.target.value);
    }
  };

  const handleLogin = async (username, password) => {
    if (!username || !password) {
      errorHandling("Please enter a username and password");
      return;
    }
    setIsLoading(true);
    const hash = hashPassword(username, password);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: hash }),
      });

      const data = await response.json();
      if (response.ok) {
        await setCookie(
          data.token,
          crypto.decryptPrivateKey(data.privateKey, password),
          data.userId,
          data.publicKey
        );
        window.location.reload();
      } else {
        errorHandling(data.error);
      }
    } catch (error) {
      errorHandling(error.message);
    }
    setIsLoading(false);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  const handleRegisterButtonClick = () => {
    setRegisterOpen(true);
  };

  return (
    <div className="login">
      <form className="form-login" onSubmit={handleLoginClick}>
        <h2>Welcome to chatJR 👋</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleInputChange}
          name="username"
          className="form-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handleInputChange}
          name="password"
          className="form-input"
        />
        <br />
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <button type="submit" className="button-login">
            Login
          </button>
          <button
            type="button"
            onClick={handleRegisterButtonClick}
            className="button-register"
          >
            Register
          </button>
        </div>
      </form>
      <RegisterForm
        className={"register"}
        isOpen={isRegisterOpen}
        onClose={setRegisterOpen}
        serverOptions={serverOptions}
        errorHandling={errorHandling}
        setIsLoading={setIsLoading}
        setPublicKey={setPublicKey}
      />
    </div>
  );
}

export default Login;
