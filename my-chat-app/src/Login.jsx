import React, { useState } from 'react';
import RegisterForm from './RegisterForm';


function Login( {setToken, setCurrentUserId, setPrivateKey, setIsLoading, hashPassword, isLoading}) {
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, updateErrorMessage] = useState('');


  const handleInputChange = (e) => {
    if (e.target.name === 'username') {
      setUsername(e.target.value);
    } else if (e.target.name === 'password') {
      setPassword(e.target.value);
    }
  };

  const errorHandling = (error) => {
    error === 'Failed to fetch' ? updateErrorMessage('Unable to reach the server') : updateErrorMessage(error);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      updateErrorMessage(null);
    }, 3000);
  };

  const handleLogin = async (username, password) => {
    if (!username || !password) {
      errorHandling('Please enter a username and password');
      return;
    }
    setIsLoading(true);
    const hash = hashPassword(username, password);
    try {
      const response = await fetch(
        `${window.location.protocol}//${window.location.hostname}:3001/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password: hash }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setCurrentUserId(data.userId);
        setPrivateKey(crypto.decryptPrivateKey(data.privateKey, password));
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

  const handleCloseRegister = () => {
    setRegisterOpen(false);
  };

  return (
    <div className='login'>
      {showError ? <span className='error-message-red'><svg xmlns="http://www.w3.org/2000/svg" style={{paddingRight:'1em', width:'1.5em'}} viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg><p>{errorMessage}</p></span> : null}
      {isLoading ? <span className="loader" style={{ position: 'absolute', top: '50%', left: '50%' }}></span> : null}
      <form className='form-login' onSubmit={handleLoginClick}>
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
      <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
        <button type="submit" className="button-login">Login</button>
        <button type="button" onClick={handleRegisterButtonClick} className="button-register">Register</button>
      </div>
      </form>
      <RegisterForm isOpen={isRegisterOpen} onClose={handleCloseRegister} />
    </div>
  );
}

export default Login;
