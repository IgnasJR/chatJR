import React, { useState } from 'react';
import RegisterForm from './RegisterForm';


function Login({ handleLogin }) {
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleInputChange = (e) => {
    if (e.target.name === 'username') {
      setUsername(e.target.value);
    } else if (e.target.name === 'password') {
      setPassword(e.target.value);
    }
  };

  const handleLoginClick = () => {
    // Call the handleLogin function passed from App.js
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
      <h2>Login:</h2>
      <p>Username</p>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={handleInputChange}
        name="username"
        className="form-input"
      />
      <p>Password</p>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handleInputChange}
        name="password"
        className="form-input"
      />
      <br />
      <button onClick={handleLoginClick} className="form-button-green">
        Login
      </button>
      <button onClick={handleRegisterButtonClick} className="form-button-green">
        Register
      </button>
      <RegisterForm isOpen={isRegisterOpen} onClose={handleCloseRegister} />
    </div>
  );
}

export default Login;
