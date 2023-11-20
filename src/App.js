import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const App = () => {
  const storedToken = localStorage.getItem('token');
  const [token, setToken] = useState(storedToken || '');
  const [loggedIn, setLoggedIn] = useState(!!storedToken);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setLoggedIn(true);
    } else {
      localStorage.removeItem('token');
      setLoggedIn(false);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setLoggedIn(false);
  };

  return (
    <div className="App">
      {!loggedIn ? (
        <LoginScreen setToken={setToken} setLoggedIn={setLoggedIn} />
      ) : (
        <AdminDashboard token={token} handleLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
