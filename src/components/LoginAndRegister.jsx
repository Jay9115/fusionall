import React, { useState } from 'react';
import './LoginAndRegister.css';
import axios from 'axios';

const LoginAndRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  
    const url = isLogin ? '/api/login' : '/api/signup';
    const payload = {
      email,
      password,
    };
  
    try {
      const response = await axios.post(url, payload);
  
      if (response.status === 200) {
        console.log('Success:', response.data);
      } else {
        console.error('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Network Error:', error);
    }
  };
  

  return (
    <div className="container">
      <div className="form-container">
        <h2>{isLogin ? 'Login' : 'Signup'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit" className="btn-primary">
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>
        <button onClick={toggleForm} className="btn-secondary">
          {isLogin
            ? "Don't have an account? Signup"
            : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default LoginAndRegister
