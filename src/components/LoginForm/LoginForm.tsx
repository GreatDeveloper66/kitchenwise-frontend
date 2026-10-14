import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/kitchenwise-logo.png'
import styles from './LoginForm.module.css';

export interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void> | void;
}

export function LoginForm({ onSubmit }: Readonly<LoginFormProps>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.logoRow}>
        <img src={logo} alt="KitchenWise logo" className={styles.logo} />
        <p className={styles.brandName}>KitchenWise</p>
      </div>

      <h1 className={styles.heading}>Welcome back</h1>
      <p className={styles.subheading}>Log in to see today's plan.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <span className={styles.errorText}>{error}</span>}

        <div className={styles.forgotRow}>
          <button type="button" className={styles.forgotLink}>
            Forgot password?
          </button>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className={styles.footerText}>
        Don't have an account?{' '}
        <Link to="/register" className={styles.footerLink}>Sign up</Link>
      </p>
    </div>
  );
}