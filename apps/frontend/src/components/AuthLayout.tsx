import { ReactNode } from 'react';
import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.panel}>{children}</div>
    </div>
  );
};

export default AuthLayout;
