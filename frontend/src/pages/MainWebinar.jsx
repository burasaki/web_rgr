import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './MainWebinar.module.css';

export const MainWebinar = () => {
  const { user, token, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newChatName, setNewChatName] = useState('');

  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      setNewChatName(user.chat_name || user.first_name || '');
    }
  }, [user]);

  useEffect(() => {
    fetch('web-rgr.onrender.com')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Ошибка загрузки истории чата:", err));
  }, []);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    socket.current = new WebSocket('wss://://onrender.com');

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === 'message') {
        setMessages(prev => [...prev, data]);
      } else if (data.action === 'like') {
        setMessages(prev => prev.map(m => m.id === data.msg_id ? { ...m, likes: data.likes, liked_by_ids: data.liked_by_ids } : m));
      }
    };

    return () => {
      if (socket.current) socket.current.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !user) return;
    
    socket.current.send(JSON.stringify({
      action: 'message',
      user_id: user.id,
      text: inputText,
      is_question: activeTab === 'qa'
    }));
    setInputText('');
  };

  const handleToggleLike = (msg_id) => {
    if (!user) {
      navigate('/register');
      return;
    }
    
    socket.current.send(JSON.stringify({
      action: 'like',
      msg_id: msg_id,
      user_id: user.id
    }));
  };

  const handleSaveChatName = async () => {
    if (!newChatName.trim()) return;
    try {
      const res = await fetch('web-rgr.onrender.com', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ chat_name: newChatName })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setIsEditingName(false);
      }
    } catch (err) {
      console.error("Ошибка обновления имени:", err);
    }
  };

  const filteredMessages = messages.filter(msg => 
    activeTab === 'qa' ? msg.is_question : !msg.is_question
  );

  return (
    <div className={styles.screenWrapper}>
      <header className={styles.mainHeader}>
        <div className={styles.logoWrapper}>
          <img src="/logo.svg" alt="YADRO" className={styles.mainLogo} />
        </div>
        <div className={styles.authWrapper}>
          {user ? (
            <>
              <span className={styles.userName}>{user.first_name || 'Пользователь'}</span>
              <button className={styles.profileBtn}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://w3.org" className={styles.profileSvg}>
                  <circle cx="16" cy="16" r="15" stroke="white" strokeWidth="2"/>
                  <circle cx="16" cy="13" r="5" stroke="white" strokeWidth="2"/>
                  <path d="M7 26C8.5 21.5 12 19 16 19C20 19 23.5 21.5 25 26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button onClick={logout} className={styles.logoutBtn} title="Выйти">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
                  <path d="M17 16L21 12M21 12L17 8M21 12H9M13 16V17C13 18.6569 11.6569 20 10 20H5C3.34315 20 2 18.6569 2 17V7C2 5.34315 3.34315 4 5 4H10C11.6569 4 13 5.34315 13 7V8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <span className={styles.userName} onClick={() => navigate('/register')}>Регистрация</span>
              <button className={styles.profileBtn} onClick={() => navigate('/register')}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://w3.org" className={styles.profileSvg}>
                  <circle cx="16" cy="16" r="15" stroke="white" strokeWidth="2"/>
                  <circle cx="16" cy="13" r="5" stroke="white" strokeWidth="2"/>
                  <path d="M7 26C8.5 21.5 12 19 16 19C20 19 23.5 21.5 25 26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </header>

      <main className={styles.contentCenter}>
        <div className={styles.dashboardLayout}>
          <div className={styles.videoSection}>
            <div className={styles.videoWrapper}>
              <video 
                className={styles.videoPlayer} 
                src="web-rgr.onrender.com"
                poster="/poster2x.png"
                controls
                autoPlay
                muted
                playsInline
              />
            </div>
          </div>

          <div className={styles.chatSection}>
            <div className={styles.chatTabs}>
              <button 
                className={activeTab === 'chat' ? styles.activeTab : styles.inactiveTab} 
                onClick={() => setActiveTab('chat')}
              >
                Чат
              </button>
              <button 
                className={activeTab === 'qa' ? styles.activeTab : styles.inactiveTab} 
                onClick={() => setActiveTab('qa')}
              >
                Вопрос / ответ
              </button>
            </div>

            <div className={styles.messagesList}>
              {filteredMessages.map((msg) => {
                const isLikedByMe = user && msg.liked_by_ids?.includes(user.id);
                return (
                  <div key={msg.id} className={styles.messageBubble}>
                    <div className={styles.msgHeader}>
                      <span className={styles.authorName}>{msg.chat_name}</span>
                      <button 
                        onClick={() => handleToggleLike(msg.id)} 
                        className={`${styles.likeBtn} ${isLikedByMe ? styles.activeLikeBtn : ''}`}
                      >
                        ❤️ <span className={styles.likeCount}>{msg.likes}</span>
                      </button>
                    </div>
                    <p className={styles.msgText}>{msg.text}</p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.chatControls}>
              {!user ? (
                <button className={styles.guestButton} onClick={() => navigate('/register')}>
                  Хотите отправить {activeTab === 'qa' ? 'вопрос' : 'сообщение'}? <br />
                  <span className={styles.guestButtonSub}>Кликните на эту кнопку</span>
                </button>
              ) : (
                <div className={styles.inputArea}>
                  <textarea 
                    placeholder={activeTab === 'qa' ? "Задайте вопрос спикеру..." : "Текст"} 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    className={styles.messageInput}
                    rows={2}
                  />
                  <button onClick={handleSendMessage} className={styles.sendBtn}>Отправить</button>
                  
                  <div className={styles.chatFooterProfile}>
                    {isEditingName ? (
                      <div className={styles.editRow}>
                        <input value={newChatName} onChange={(e) => setNewChatName(e.target.value)} />
                        <button onClick={handleSaveChatName}>Ок</button>
                      </div>
                    ) : (
                      <>
                        <span>Имя в чате: {user.chat_name || user.first_name}</span>
                        <button onClick={() => setIsEditingName(true)} className={styles.editLink}>Ред.</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
