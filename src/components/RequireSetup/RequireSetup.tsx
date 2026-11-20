import { Navigate, Outlet } from 'react-router-dom';
import { useDietProfile } from '../../queries/useDietProfile';
import { useLatestPlan } from '../../queries/useLatestPlan';
import { useMealImages } from '../../queries/useMealImages';
import { errorStatus } from '../../services/api';
import { PageStatus } from '../PageStatus/PageStatus';
import { SessionExpired } from '../SessionExpired/SessionExpired';
import styles from './RequireSetup.module.css';

/**
 * Lets users into the main app only once they have a diet profile and a saved plan.
 * Anyone missing either (new account, or setup interrupted) goes to /onboarding,
 * however they arrived. Both answers are cached, so this costs two requests per session.
 */
export function RequireSetup() {
  const profile = useDietProfile();
  const plan = useLatestPlan();
  // Pictures are made in the background after setup, so they never hold up the app
  useMealImages(plan.data);

  if (errorStatus(profile.error) === 401 || errorStatus(plan.error) === 401) {
    return <SessionExpired />;
  }

  if (profile.isError || plan.isError) {
    const retry = () => {
      if (profile.isError) void profile.refetch();
      if (plan.isError) void plan.refetch();
    };
    return (
      <div className={styles.fullPage}>
        <PageStatus
          title="Something went wrong"
          message={(profile.error ?? plan.error)?.message ?? 'Could not load your account.'}
          isError
        >
          <button type="button" className={styles.retryButton} onClick={retry}>
            Try again
          </button>
        </PageStatus>
      </div>
    );
  }

  if (profile.isPending || plan.isPending) {
    return (
      <div className={styles.fullPage}>
        <PageStatus message="Loading your plan…" busy />
      </div>
    );
  }

  if (!profile.data || !plan.data) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
