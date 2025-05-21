import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';

const ADMIN_LOGIN_KEY = 'admin_login_time';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Перевіряємо, чи є збережений логін і чи не минула доба
    const lastLogin = localStorage.getItem(ADMIN_LOGIN_KEY);
    if (lastLogin && Date.now() - Number(lastLogin) < ONE_DAY_MS) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem(ADMIN_LOGIN_KEY, Date.now().toString());
      navigate('/admin');
    } catch (error) {
      setError('Невірний email або пароль');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Вхід для адміністратора
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Увійти
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage; 