import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainWebinar } from './pages/MainWebinar';
import { RegisterForm } from './pages/RegisterForm';
import { CodeForm } from "./pages/CodeForm";
import { LoginForm } from "./pages/LoginForm";



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainWebinar />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/code" element={<CodeForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
