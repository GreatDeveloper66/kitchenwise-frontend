import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import logo from '../../assets/kitchenwise-logo.png';
import { DietProfileForm } from '../../components/DietProfileForm/DietProfileForm';
import { PageStatus } from '../../components/PageStatus/PageStatus';
import { SessionExpired } from '../../components/SessionExpired/SessionExpired';
import { useAuth } from '../../hooks/useAuth';
import { queryKeys } from '../../queries/queryKeys';
import { useDietProfile } from '../../queries/useDietProfile';
import { useLatestPlan } from '../../queries/useLatestPlan';
import { errorStatus } from '../../services/api';
import {
  createDietProfile,
  getDietProfile,
  type DietProfile,
  type DietProfileValues,
} from '../../services/dietProfileService';
import { generatePlan, storePlan } from '../../services/planSetupService';
import type { MealPlan } from '../../services/types';
import styles from './OnboardingPage.module.css';

type PlanPhase =
  | { kind: 'idle' }
  | { kind: 'generating' }
  | { kind: 'saving' }
  | { kind: 'failed'; message: string };

/**
 * First-run setup: diet profile form, then generate and save the first priced meal plan.
 * Each step is remembered, so a failure retries only the step that failed:
 * - profile saved but generation failed: retry generates again (the profile isn't re-sent)
 * - generated but save failed: retry saves the plan already generated (no second AI call)
 * A user who left partway through comes back here (via RequireSetup) at the step they reached.
 */
export function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const profileQuery = useDietProfile();
  const planQuery = useLatestPlan();

  const [phase, setPhase] = useState<PlanPhase>({ kind: 'idle' });
  // A generated plan that hasn't been saved yet. A ref, because it never affects rendering.
  const unsavedPlan = useRef<MealPlan | null>(null);

  const buildPlan = async (profile: DietProfile) => {
    try {
      let plan = unsavedPlan.current;
      if (!plan) {
        setPhase({ kind: 'generating' });
        plan = await generatePlan(profile);
        unsavedPlan.current = plan;
      }
      setPhase({ kind: 'saving' });
      const saved = await storePlan(plan);
      unsavedPlan.current = null;
      queryClient.setQueryData(queryKeys.latestPlan, saved);
      await navigate('/dashboard', { replace: true });
    } catch (err) {
      setPhase({
        kind: 'failed',
        message: err instanceof Error ? err.message : 'Could not build your meal plan.',
      });
    }
  };

  const handleProfileSubmit = async (values: DietProfileValues) => {
    let profile: DietProfile;
    try {
      profile = await createDietProfile(values);
    } catch (err) {
      // 409: a profile already exists (double submit, or another tab). Use it and carry on.
      if (errorStatus(err) !== 409) throw err; // the form shows the message
      const existing = await getDietProfile();
      if (!existing) throw err;
      profile = existing;
    }
    setPhase({ kind: 'generating' });
    queryClient.setQueryData(queryKeys.dietProfile, profile);
    // Not awaited: the form unmounts now and the plan panel shows progress
    void buildPlan(profile);
  };

  const handleLogout = async () => {
    await signOut();
    await navigate('/', { replace: true });
  };

  const renderBody = () => {
    if (errorStatus(profileQuery.error) === 401 || errorStatus(planQuery.error) === 401) {
      return <SessionExpired />;
    }

    if (profileQuery.isError || planQuery.isError) {
      return (
        <PageStatus
          title="Something went wrong"
          message={(profileQuery.error ?? planQuery.error)?.message ?? 'Could not load your account.'}
          isError
        >
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              if (profileQuery.isError) void profileQuery.refetch();
              if (planQuery.isError) void planQuery.refetch();
            }}
          >
            Try again
          </button>
        </PageStatus>
      );
    }

    if (profileQuery.isPending || planQuery.isPending) {
      return <PageStatus message="Loading…" busy />;
    }

    const profile = profileQuery.data;

    // Setup is already done (for example, the user opened /onboarding directly)
    if (profile && planQuery.data) {
      return <Navigate to="/dashboard" replace />;
    }

    if (!profile) {
      return (
        <>
          <h1 className={styles.heading}>
            {user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome'}
          </h1>
          <p className={styles.subheading}>
            Tell us a little about yourself and we'll build a meal plan around your needs and
            your grocery budget.
          </p>
          <DietProfileForm
            onSubmit={handleProfileSubmit}
            submitLabel="Build my meal plan"
            submittingLabel="Saving your profile…"
          />
        </>
      );
    }

    switch (phase.kind) {
      case 'generating':
        return (
          <PageStatus
            title="Building your meal plan"
            message="This usually takes under a minute. Please keep this page open."
            busy
          />
        );
      case 'saving':
        return <PageStatus title="Almost there" message="Saving your meal plan…" busy />;
      case 'failed':
        return (
          <PageStatus title="We couldn't finish your plan" message={phase.message} isError>
            <p className={styles.note}>Your profile is saved, so you won't need to fill it in again.</p>
            <button type="button" className={styles.primaryButton} onClick={() => void buildPlan(profile)}>
              Try again
            </button>
          </PageStatus>
        );
      case 'idle':
        // Profile saved in an earlier visit, but no plan yet
        return (
          <PageStatus
            title="Your profile is saved"
            message="One step left: let's build your first meal plan. It usually takes under a minute."
          >
            <button type="button" className={styles.primaryButton} onClick={() => void buildPlan(profile)}>
              Build my meal plan
            </button>
          </PageStatus>
        );
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="" className={styles.logo} />
          <span className={styles.brandName}>KitchenWise</span>
        </div>
        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className={styles.card}>{renderBody()}</main>
    </div>
  );
}
