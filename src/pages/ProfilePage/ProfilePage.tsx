import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { DietProfileForm } from '../../components/DietProfileForm/DietProfileForm';
import { PageStatus } from '../../components/PageStatus/PageStatus';
import { SessionExpired } from '../../components/SessionExpired/SessionExpired';
import { useAuth } from '../../hooks/useAuth';
import { queryKeys } from '../../queries/queryKeys';
import { useDietProfile } from '../../queries/useDietProfile';
import { errorStatus } from '../../services/api';
import {
  updateDietProfile,
  type DietProfile,
  type DietProfileValues,
  type DietaryPreference,
} from '../../services/dietProfileService';
import type { MealPlanRequest } from '../../services/mealPlanService';
import { generatePlan, storePlan } from '../../services/planSetupService';
import type { MealPlan } from '../../services/types';
import styles from './ProfilePage.module.css';

type Phase =
  | { kind: 'idle' }
  | { kind: 'generating' }
  | { kind: 'savingProfile' }
  | { kind: 'savingPlan' }
  | { kind: 'failed'; message: string; profileSaved: boolean }
  | { kind: 'expired' };

/** A profile change in progress. Each step is remembered so a retry repeats only what failed. */
interface PendingChange {
  values: MealPlanRequest;
  /** Generated but not yet saved. Kept so a failed save never costs a second AI call. */
  plan: MealPlan | null;
  profileSaved: boolean;
}

// 'Normal' means "no restriction", so ignore it and compare order-independently
function restrictions(prefs: DietaryPreference[] | undefined): string {
  return (prefs ?? []).filter((pref) => pref !== 'Normal').sort().join(',');
}

function isSameProfile(a: DietProfileValues, b: DietProfileValues): boolean {
  return (
    a.age === b.age &&
    a.sex === b.sex &&
    Math.abs(a.weight - b.weight) < 0.01 &&
    Math.abs(a.height - b.height) < 0.01 &&
    a.activityLevel === b.activityLevel &&
    a.budgetLevel === b.budgetLevel &&
    restrictions(a.dietaryPreferences) === restrictions(b.dietaryPreferences)
  );
}

/**
 * Edit the diet profile. Every profile field feeds the meal plan, so any real change builds a
 * new plan (one billable AI call). Order matters:
 *   1. generate the new plan from the new values (nothing saved yet)
 *   2. update the diet profile
 *   3. save the new plan
 * so a failed generation leaves the profile and the saved plan exactly as they were.
 * Meal pictures for the new plan are added in the background by useMealImages (in RequireSetup).
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const profileQuery = useDietProfile();

  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [notice, setNotice] = useState<string | null>(null);
  const pending = useRef<PendingChange | null>(null);

  const applyChange = async () => {
    const change = pending.current;
    if (!change) return;

    try {
      if (!change.plan) {
        setPhase({ kind: 'generating' });
        change.plan = await generatePlan(change.values);
      }

      if (!change.profileSaved) {
        setPhase({ kind: 'savingProfile' });
        await updateDietProfile(change.values);
        change.profileSaved = true;
        // Merge what we sent instead of trusting the PATCH response's shape
        queryClient.setQueryData<DietProfile | null>(queryKeys.dietProfile, (old) =>
          old ? { ...old, ...change.values } : old
        );
      }

      setPhase({ kind: 'savingPlan' });
      const saved = await storePlan(change.plan);
      queryClient.setQueryData(queryKeys.latestPlan, saved);
      pending.current = null;
      await navigate('/dashboard');
    } catch (err) {
      if (errorStatus(err) === 401) {
        setPhase({ kind: 'expired' });
        return;
      }
      setPhase({
        kind: 'failed',
        message: err instanceof Error ? err.message : 'Could not update your profile.',
        profileSaved: change.profileSaved,
      });
    }
  };

  const handleSubmit = (values: DietProfileValues) => {
    setNotice(null);
    const current = profileQuery.data;
    if (!current) return;

    const next: MealPlanRequest = {
      ...values,
      dietaryPreferences: values.dietaryPreferences ?? ['Normal'],
    };

    if (isSameProfile(current, next)) {
      setNotice("You haven't changed anything, so your meal plan stays as it is.");
      return;
    }

    pending.current = { values: next, plan: null, profileSaved: false };
    void applyChange();
  };

  const discardChange = () => {
    pending.current = null;
    setPhase({ kind: 'idle' });
  };

  const renderDietSection = () => {
    if (phase.kind === 'expired' || errorStatus(profileQuery.error) === 401) {
      return <SessionExpired />;
    }

    if (profileQuery.isError) {
      return (
        <PageStatus title="Something went wrong" message={profileQuery.error.message} isError>
          <button type="button" className={styles.secondaryButton} onClick={() => void profileQuery.refetch()}>
            Try again
          </button>
        </PageStatus>
      );
    }

    if (profileQuery.isPending) {
      return <PageStatus message="Loading your profile…" busy />;
    }

    switch (phase.kind) {
      case 'generating':
        return (
          <PageStatus
            title="Building your new meal plan"
            message="This usually takes under a minute. Please keep this page open."
            busy
          />
        );
      case 'savingProfile':
        return <PageStatus title="Almost there" message="Saving your profile…" busy />;
      case 'savingPlan':
        return <PageStatus title="Almost there" message="Saving your new meal plan…" busy />;
      case 'failed':
        return (
          <PageStatus title="We couldn't finish your update" message={phase.message} isError>
            <p className={styles.note}>
              {phase.profileSaved
                ? 'Your profile changes are saved. Only the new meal plan is left.'
                : 'Nothing has changed yet: your profile and meal plan are as they were.'}
            </p>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.primaryButton} onClick={() => void applyChange()}>
                Try again
              </button>
              {!phase.profileSaved && (
                <button type="button" className={styles.secondaryButton} onClick={discardChange}>
                  Discard changes
                </button>
              )}
            </div>
          </PageStatus>
        );
      case 'idle': {
        // RequireSetup guarantees a profile, so null here would mean the cache was cleared
        if (!profileQuery.data) {
          return <PageStatus message="We couldn't find your profile." isError />;
        }
        return (
          <>
            <p className={styles.note}>
              Changing your details builds a new meal plan, which usually takes under a minute.
            </p>
            {notice && (
              <p className={styles.notice} role="status">
                {notice}
              </p>
            )}
            <DietProfileForm
              onSubmit={handleSubmit}
              initialValues={profileQuery.data}
              submitLabel="Save and rebuild my plan"
              submittingLabel="Saving…"
            />
          </>
        );
      }
    }
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profile</h1>

      <section className={styles.card} aria-labelledby="account-heading">
        <h2 id="account-heading" className={styles.cardTitle}>Account</h2>
        <dl className={styles.details}>
          <dt>Name</dt>
          <dd>{fullName || '—'}</dd>
          <dt>Email</dt>
          <dd>{user?.email ?? '—'}</dd>
        </dl>
      </section>

      <section className={styles.card} aria-labelledby="diet-heading">
        <h2 id="diet-heading" className={styles.cardTitle}>Diet profile</h2>
        {renderDietSection()}
      </section>
    </div>
  );
}