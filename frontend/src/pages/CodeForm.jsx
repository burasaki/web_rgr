import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CodeForm.module.css';

export const CodeForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Поле обязательно для заполнения');
      return;
    }

    try {
      const response = await fetch('/api/auth/code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
        setError('');
      } else {
        const data = await response.json();
        setError(data.detail || 'Пользователь с такой почтой не найден');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <div className={styles.authBackground}>
      {/* Логотип в левом верхнем углу */}
      <div className={styles.logoHeader}>
        <img src="/logo.svg" alt="YADRO" className={styles.mainLogo} />
      </div>

      {/* Переключатель вкладок по центру */}
      <div className={styles.tabContainer}>
        <button className={styles.inactiveTab} onClick={() => navigate('/register')}>Регистрация</button>
        <button className={styles.activeTab}>Код доступа</button>
        <button className={styles.inactiveTab} onClick={() => navigate('/login')}>Вход</button>
      </div>


      {/* Белая карточка формы */}
      <div className={styles.authCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.fieldContainer}>
            <label className={styles.label}>
              Укажите электронную почту для восстановления кода
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="my_email@mail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`${styles.input} ${error ? styles.errorInput : ''}`}
              />
            </div>
            {error && <div className={styles.errorText}>{error}</div>}
            {success && <div className={styles.successText}>Код успешно отправлен на почту!</div>}
          </div>

          <button type="submit" className={styles.submitBtn}>
            Отправить код
          </button>
        </form>
      </div>
    </div>
  );
};
