import { useNavigate } from 'react-router-dom';
import { LoginForm, type LoginFormValues } from '../../components/LoginForm/LoginForm';
import styles from './LoginPage.module.css';
import { login, saveSession } from '../../services/authService';

export function LoginPage() {
  const navigate = useNavigate();

const handleLogin = async (values: LoginFormValues) => {
  const auth = await login(values);
  saveSession(auth);
  await navigate('/dashboard');
};

  return (
    <div className={styles.pageWrapper}>
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}