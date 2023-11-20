import React, { useState } from 'react';
import axios from 'axios';
// import '../App.css';
import './LoginScreen.css';

const LoginScreen = ({ setToken, setLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://stg.dhunjam.in/account/admin/login', {
        username,
        password,
      });

      const { token } = response.data.data;
      setToken(token);
      setLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      alert('Please enter the correct username and password.');
    }
  };

  const validateForm = () => {
    if (username !== 'DJ@4' || password !== 'Dhunjam@2023') {
      alert('Please enter the correct username and password.');
      return false;
    }
    return true;
  };

  return (
    <div className="login-container">
      <h2 className="login-heading">Venue Admin Login</h2>
      <div className="login-field">
        <input type="text" className='input_field' value={username} placeholder='username' onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="login-field">
        <input type="password" className='input_field' value={password} placeholder='password' onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="login-button">
        <button className='btn' onClick={() => validateForm() && handleLogin()}>Sign In</button>
        <a href="#"className='register'>New User? Sign Up Here</a>
      </div>
    </div>
  );
};

export default LoginScreen;
