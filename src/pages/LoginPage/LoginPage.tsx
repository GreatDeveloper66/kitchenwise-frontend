import { useNavigate } from 'react-router-dom';
import { LoginForm, type LoginFormValues } from '../../components/LoginForm/LoginForm';
import { login } from '../../services/authService';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    const { token, user } = await login(values);

    // Store the token so the axios interceptor can attach it to future requests
    localStorage.setItem('kitchenwise_token', token);
    localStorage.setItem('kitchenwise_user', JSON.stringify(user));

    await navigate('/dashboard');
  };

  return (
    <div className={styles.pageWrapper}>
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}