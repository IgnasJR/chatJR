import React, { useState } from "react";
import Login from "./Pages/Login";
import Chat from "./Pages/Chat";
import Cookies from "js-cookie";
import crypto from "./crypto";

function App() {
  const [private_key, setPrivateKey] = useState(Cookies.get("privateKey"));
  const [public_key, setPublicKey] = useState(Cookies.get("publicKey"));
  const [currentUserId, setCurrentUserId] = useState(
    parseInt(Cookies.get("userId"))
  );
  const [token, setToken] = useState(Cookies.get("token"));
  const [errorMessage, updateErrorMessage] = useState({
    errorStatus: false,
    message: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const setCookie = (token, privateKey, userId, publicKey) => {
    Cookies.set("token", token, { expires: 7, secure: false });
    Cookies.set("privateKey", privateKey, { expires: 7, secure: false });
    Cookies.set("userId", userId, { expires: 7, secure: false });
    Cookies.set("publicKey", publicKey, { expires: 7, secure: false });
  };
  const removeCookie = () => {
    Cookies.remove("token");
    Cookies.remove("privateKey");
    Cookies.remove("userId");
    Cookies.remove("publicKey");
  };

  const errorHandling = (error) => {
    switch (error) {
      case "Failed to fetch":
        updateErrorMessage({
          message: "Unable to reach the server",
          errorStatus: true,
        });
        break;

      default:
        updateErrorMessage({ message: error, errorStatus: true });
        break;
    }
    setTimeout(() => {
      updateErrorMessage({ message: null, errorStatus: false });
    }, 3000);
  };

  return (
    <div className="container">
      {isLoading ? (
        <span
          className="loader"
          style={{ position: "absolute", top: "50%", left: "50%" }}
        ></span>
      ) : null}
      {errorMessage.errorStatus ? (
        <span className="error-message-red">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ paddingRight: "1em", width: "1.5em" }}
            viewBox="0 0 512 512"
          >
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
          </svg>
          <p>{errorMessage.message}</p>
        </span>
      ) : null}
      {token ? (
        <Chat
          currentUserId={currentUserId}
          token={token}
          isLoading={isLoading}
          public_key={public_key}
          errorHandling={errorHandling}
          errorMessage={errorMessage}
          removeCookie={removeCookie}
          crypto={crypto}
          setIsLoading={setIsLoading}
          private_key={private_key}
        />
      ) : (
        <Login
          handleLogin
          setToken={setToken}
          setCurrentUserId={setCurrentUserId}
          setPrivateKey={setPrivateKey}
          setPublicKey={setPublicKey}
          setIsLoading={setIsLoading}
          hashPassword={crypto.hashPassword}
          errorHandling={errorHandling}
          setCookie={setCookie}
        />
      )}
    </div>
  );
}

export default App;
