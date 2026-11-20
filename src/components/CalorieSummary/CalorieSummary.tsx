import styles from './CalorieSummary.module.css';

interface CalorieSummaryProps {
  /** Calories eaten so far. Omit until intake tracking exists: the card then shows the plan total. */
  consumed?: number;
  goal: number;
  proteinGrams: number;
  carbsGrams: number;
}

export function CalorieSummary({ consumed, goal, proteinGrams, carbsGrams }: Readonly<CalorieSummaryProps>) {
  const isTracking = consumed !== undefined;
  const percent = isTracking && goal > 0 ? Math.min(consumed / goal, 1) * 100 : 0;

  return (
    <section className={styles.hero} aria-label="Daily calorie summary">
      <div className={styles.top}>
        <div>
          <p className={styles.label}>{isTracking ? 'Calories today' : 'Planned for today'}</p>
          <p className={styles.value}>
            {isTracking ? (
              <>
                {consumed.toLocaleString()} <span className={styles.goal}>/ {goal.toLocaleString()}</span>
              </>
            ) : (
              <>
                {goal.toLocaleString()} <span className={styles.goal}>calories</span>
              </>
            )}
          </p>
        </div>

        <div className={styles.macros}>
          <div className={styles.macro}>
            <p className={styles.macroValue}>{proteinGrams}g</p>
            <p className={styles.macroLabel}>protein</p>
          </div>
          <div className={styles.macro}>
            <p className={styles.macroValue}>{carbsGrams}g</p>
            <p className={styles.macroLabel}>carbs</p>
          </div>
        </div>
      </div>

      {isTracking && (
        <div className={styles.track} role="progressbar" aria-valuenow={consumed} aria-valuemin={0} aria-valuemax={goal}>
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
      )}
    </section>
  );
}