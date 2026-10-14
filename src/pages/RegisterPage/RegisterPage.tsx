import { useNavigate } from 'react-router-dom';
import { RegisterForm, type RegisterFormValues } from '../../components/RegisterForm/RegisterForm';
import { register, saveSession } from '../../services/authService';
import styles from './RegisterPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (values: RegisterFormValues) => {
    const auth = await register(values);
    saveSession(auth);
    await navigate('/dashboard');
  };

  return (
    <div className={styles.pageWrapper}>
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}