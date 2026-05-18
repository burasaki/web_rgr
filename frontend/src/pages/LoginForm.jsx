import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Input } from '../components/Input';
import styles from './RegisterForm.module.css'; // Используем уже готовые стили от регистрации

export const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Электронная почта обязательна для входа');
      return;
    }

    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          login(data.token, data.user);
          navigate('/'); // Перенаправляем на главный экран вебинара
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Пользователь с таким email не найден');
      }
    } catch (err) {
      setError('Не удалось связаться с сервером');
    }
  };

  return (
    <div className={styles.authBackground}>
      <div className={styles.logoContainer}>
        <img src="/logo.svg" alt="YADRO" className={styles.logoImg} />
      </div>

      {/* Панель вкладок с активной кнопкой "Вход" */}
      <div className={styles.tabContainer}>
        <button className={styles.inactiveTab} onClick={() => navigate('/register')}>Регистрация</button>
        <button className={styles.inactiveTab} onClick={() => navigate('/code')}>Код доступа</button>
        <button className={styles.activeTab}>Вход</button>
      </div>

      <div className={styles.authCard}>
        <h2 className={styles.cardTitle}>Войти в существующий аккаунт</h2>
        
        <form onSubmit={handleLoginSubmit}>
          <Input
            label="Электронная почта"
            type="email"
            placeholder="my_email@mail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
            error={error}
          />

          {error && <div className={styles.serverError}>{error}</div>}

          <button type="submit" className={styles.submitBtn}>Войти</button>
        </form>
      </div>
    </div>
  );
};
