import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.scss';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.langButton} ${i18n.language === 'ko' ? styles.active : ''}`}
        onClick={() => changeLanguage('ko')}
        aria-label='Switch to Korean'
      >
        한국어
      </button>
      <button
        className={`${styles.langButton} ${i18n.language === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
        aria-label='Switch to English'
      >
        English
      </button>
    </div>
  );
};

export default LanguageSwitcher;

