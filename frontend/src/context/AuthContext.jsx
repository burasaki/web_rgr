import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

// Выносим базовый URL в константу для удобства поддержки
const BASE_URL = 'https://web-rgr.onrender.com/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // При первой загрузке или обновлении страницы запрашиваем актуальный профиль с сервера по токену
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      
      // ИСПРАВЛЕНО: Запрос перенаправлен на корректный эндпоинт получения текущего пользователя (/auth/user/update/)
      fetch(`${BASE_URL}/auth/user/update/`, { 
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        } 
      })
        .then(res => {
          if (!res.ok) throw new Error('Невалидный токен');
          return res.json();
        })
        .then(data => {
          setUser(data); // Успешно записываем актуальные данные профиля в стейт
        })
        .catch((err) => {
          console.error("Ошибка проверки токена при инициализации сессии:", err);
          logout();
        });
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // Изменяем функцию login, чтобы она сразу принимала и токен, и данные пользователя
  const login = (jwtToken, userData) => {
    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
    }
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => { 
    localStorage.removeItem('token');
    setToken(null); 
    setUser(null); 
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};