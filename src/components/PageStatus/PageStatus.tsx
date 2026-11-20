import type { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import styles from './PageStatus.module.css';

interface PageStatusProps {
  title?: string;
  message: string;
  /** Shows a spinner and announces the message politely to screen readers. */
  busy?: boolean;
  /** Announces the message as an alert (for errors). */
  isError?: boolean;
  children?: ReactNode;
}

/** A centered loading, empty, or error message for a whole page or panel. */
export function PageStatus({ title, message, busy = false, isError = false, children }: Readonly<PageStatusProps>) {
  return (
    <div className={styles.status} role={isError ? 'alert' : 'status'} aria-busy={busy}>
      {busy && <LoaderCircle className={styles.spinner} size={32} aria-hidden="true" />}
      {title && <h2 className={styles.title}>{title}</h2>}
      <p className={isError ? `${styles.message} ${styles.error}` : styles.message}>{message}</p>
      {children}
    </div>
  );
}
