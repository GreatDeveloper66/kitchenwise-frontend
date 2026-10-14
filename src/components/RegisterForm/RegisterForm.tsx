import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/kitchenwise-logo.png';
import styles from './RegisterForm.module.css';

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => Promise<void> | void;
}

type FieldErrors = Partial<
  Record<'name' | 'email' | 'password' | 'confirmPassword' | 'terms', string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = 'Please enter your name.';
    if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.';
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';
    if (!acceptedTerms) errors.terms = 'You must accept the terms to continue.';
    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      await onSubmit({ name: name.trim(), email, password });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof FieldErrors) =>
    fieldErrors[field] ? `${styles.input} ${styles.inputError}` : styles.input;

  return (
    <div className={styles.card}>
      <div className={styles.logoRow}>
        <img src={logo} alt="KitchenWise logo" className={styles.logo} />
        <p className={styles.brandName}>KitchenWise</p>
      </div>

      <h1 className={styles.heading}>Create your account</h1>
      <p className={styles.subheading}>Set up your profile to get personalized plans.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Full name</label>
          <input
            id="name"
            type="text"
            className={inputClass('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          {fieldErrors.name && <span className={styles.errorText}>{fieldErrors.name}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            className={inputClass('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {fieldErrors.email && <span className={styles.errorText}>{fieldErrors.email}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            className={inputClass('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {fieldErrors.password && <span className={styles.errorText}>{fieldErrors.password}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            className={inputClass('confirmPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && (
            <span className={styles.errorText}>{fieldErrors.confirmPassword}</span>
          )}
        </div>

        <label className={styles.termsRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <span className={styles.termsText}>
            I agree to the <span className={styles.termsEmphasis}>Terms of Service</span> and{' '}
            <span className={styles.termsEmphasis}>Privacy Policy</span>
          </span>
        </label>
        {fieldErrors.terms && <span className={styles.errorText}>{fieldErrors.terms}</span>}

        {formError && <span className={styles.formError}>{formError}</span>}

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className={styles.footerText}>
        Already have an account?{' '}
        <Link to="/" className={styles.footerLink}>Log in</Link>
      </p>
    </div>
  );
}