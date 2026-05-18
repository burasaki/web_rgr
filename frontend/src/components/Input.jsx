import React from 'react';
import styles from './Input.module.css';

export const Input = ({ label, required, error, ...props }) => {
  return (
    <div className={styles.fieldContainer}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input 
          className={`${styles.input} ${error ? styles.errorInput : ''}`} 
          {...props} 
        />
        <span className={styles.asteriskIcon}>*</span>
      </div>
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
};
