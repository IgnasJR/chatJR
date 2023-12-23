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
