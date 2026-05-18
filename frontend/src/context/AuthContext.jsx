import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // При первой загрузке или обновлении страницы запрашиваем актуальный профиль с сервера по токену
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      
      fetch('https://onrender.com', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      })
        .then(res => {
          if (!res.ok) throw new Error('Невалидный токен');
          return res.json();
        })
        .then(data => {
          setUser(data); // Записываем данные профиля в стейт
        })
        .catch(() => logout());
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
  }, [token]);

  // Изменяем функцию login, чтобы она сразу принимала и токен, и данные пользователя
  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => { 
    setToken(null); 
    setUser(null); 
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
