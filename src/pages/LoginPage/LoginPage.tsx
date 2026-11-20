import { useNavigate } from 'react-router-dom';
import { LoginForm, type LoginFormValues } from '../../components/LoginForm/LoginForm';
import { login } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (values: LoginFormValues) => {
    const auth = await login(values);
    signIn(auth);
    // RequireSetup sends users without a diet profile or plan on to /onboarding
    await navigate('/dashboard');
  };

  return (
    <div className={styles.pageWrapper}>
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}
