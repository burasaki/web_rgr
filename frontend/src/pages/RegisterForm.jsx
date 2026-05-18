import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Input } from '../components/Input';
import styles from './RegisterForm.module.css';

export const RegisterForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Состояния для полей формы
  const [email, setEmail] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  
  // Состояния для ошибок валидации
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Валидация на фронтенде перед отправкой (Страница 12)
    if (!email) newErrors.email = 'Электронная почта обязательна для заполнения';
    if (!lastName) newErrors.lastName = 'Поле, обязательное для заполнения';
    if (!firstName) newErrors.firstName = 'Поле, обязательное для заполнения';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          last_name: lastName,
          first_name: firstName,
          username: email // Автоматический username для Django
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Сохраняем полученный JWT токен и перенаправляем на главную
        if (data.token) {
          login(data.token, data.user);
          navigate('/');
        }
      } else {
        const errorData = await response.json();
        setErrors({ server: errorData.detail || 'Ошибка регистрации' });
      }
    } catch (err) {
      setErrors({ server: 'Не удалось связаться с сервером' });
    }
  };

  return (
    <div className={styles.authBackground}>
      <div className={styles.logoContainer}>
        <img src="/logo.svg" alt="YADRO" className={styles.logoImg} />
      </div>

      <div className={styles.tabContainer}>
        <button className={styles.activeTab}>Регистрация</button>
        <button className={styles.inactiveTab} onClick={() => navigate('/code')}>Код доступа</button>
        <button className={styles.inactiveTab} onClick={() => navigate('/login')}>Вход</button> {/* Третья кнопка */}
      </div>

      <div className={styles.authCard}>
        <h2 className={styles.cardTitle}>Данные для авторизации</h2>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Электронная почта"
            type="email"
            placeholder="my_email@mail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors(prev => ({ ...prev, email: '' }));
            }}
            required
            error={errors.email}
          />

          <h2 className={styles.cardTitle} style={{ marginTop: '32px' }}>Прочие данные</h2>

          <Input
            label="Фамилия"
            type="text"
            placeholder="Ваша фамилия"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setErrors(prev => ({ ...prev, lastName: '' }));
            }}
            required
            error={errors.lastName}
          />

          <Input
            label="Имя"
            type="text"
            placeholder="Ваше имя"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors(prev => ({ ...prev, firstName: '' }));
            }}
            required
            error={errors.firstName}
          />

          {errors.server && <div className={styles.serverError}>{errors.server}</div>}

          <button type="submit" className={styles.submitBtn}>Отправить</button>
        </form>

        <p className={styles.hintText}>* поле, обязательное для заполнения</p>
      </div>
    </div>
  );
};
