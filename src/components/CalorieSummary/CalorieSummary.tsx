import styles from './CalorieSummary.module.css';

interface CalorieSummaryProps {
  consumed: number;
  goal: number;
  proteinGrams: number;
  carbsGrams: number;
}

export function CalorieSummary({ consumed, goal, proteinGrams, carbsGrams }: Readonly<CalorieSummaryProps>) {
  const percent = Math.min(consumed / goal, 1) * 100;

  return (
    <section className={styles.hero} aria-label="Daily calorie summary">
      <div className={styles.top}>
        <div>
          <p className={styles.label}>Calories today</p>
          <p className={styles.value}>
            {consumed.toLocaleString()} <span className={styles.goal}>/ {goal.toLocaleString()}</span>
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

      <div className={styles.track} role="progressbar" aria-valuenow={consumed} aria-valuemin={0} aria-valuemax={goal}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}