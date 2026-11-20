import { useNavigate } from 'react-router-dom';
import { RegisterForm, type RegisterFormValues } from '../../components/RegisterForm/RegisterForm';
import { register } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import styles from './RegisterPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleRegister = async (values: RegisterFormValues) => {
    // /register returns the same { user, token } as /login, so the user is signed in right away
    const auth = await register(values);
    signIn(auth);
    await navigate('/onboarding');
  };

  return (
    <div className={styles.pageWrapper}>
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}
