import { Link } from 'react-router-dom';
import { FoodList } from '../../components/FoodList/FoodList';
import { PageStatus } from '../../components/PageStatus/PageStatus';
import { useLatestPlan } from '../../queries/useLatestPlan';
import type { Meal, MealName } from '../../services/types';
import { formatGrams as grams, sumFoods, sumPrices } from '../../utils/nutrition';
import styles from './PlanPage.module.css';

const MEAL_ORDER: MealName[] = ['breakfast', 'lunch', 'dinner'];

const MEAL_LABELS: Record<MealName, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/**
 * Plan dates are stored as ISO strings, sometimes with a time ("2026-11-24T00:00:00.000Z").
 * Read only the calendar day and build a local date, so a time zone never shifts it a day.
 */
function formatPlanDate(iso: string): string | null {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function PlanPage() {
  // RequireSetup has already loaded this, so it comes straight from the cache
  const { data: savedPlan } = useLatestPlan();
  const plan = savedPlan?.mealPlan;

  const meals: Meal[] = plan
    ? MEAL_ORDER.map((name) => plan.meals.find((meal) => meal.name === name)).filter(
        (meal): meal is Meal => meal !== undefined
      )
    : [];

  if (!plan || meals.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Meal plan</h1>
        <PageStatus message="Your meal plan has no meals yet." />
      </div>
    );
  }

  const builtOn = formatPlanDate(savedPlan?.date ?? plan.date);
  const totalPrice = sumPrices(meals);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Meal plan</h1>
      {builtOn && <p className={styles.subtitle}>Built on {builtOn}</p>}

      <dl className={styles.totals} aria-label="Daily totals">
        <div className={styles.total}>
          <dt>Calories</dt>
          <dd>{sumFoods(meals, 'calories')}</dd>
        </div>
        <div className={styles.total}>
          <dt>Protein</dt>
          <dd>{grams(sumFoods(meals, 'protein'))}</dd>
        </div>
        <div className={styles.total}>
          <dt>Carbs</dt>
          <dd>{grams(sumFoods(meals, 'carbs'))}</dd>
        </div>
        <div className={styles.total}>
          <dt>Fat</dt>
          <dd>{grams(sumFoods(meals, 'fat'))}</dd>
        </div>
        {totalPrice !== undefined && (
          <div className={styles.total}>
            <dt>Groceries</dt>
            <dd>{currency.format(totalPrice)}</dd>
          </div>
        )}
      </dl>

      {meals.map((meal) => (
        <section key={meal.id} className={styles.meal} aria-labelledby={`meal-${meal.id}`}>
          {meal.image && <img src={meal.image} alt="" className={styles.image} loading="lazy" />}

          <div className={styles.mealBody}>
            <div className={styles.mealHeader}>
              <h2 id={`meal-${meal.id}`} className={styles.mealTitle}>
                {MEAL_LABELS[meal.name]}
              </h2>
              {meal.price !== undefined && (
                <span className={styles.price}>{currency.format(meal.price)}</span>
              )}
            </div>
            <p className={styles.mealMeta}>
              {sumFoods([meal], 'calories')} cal · P {grams(sumFoods([meal], 'protein'))} · C{' '}
              {grams(sumFoods([meal], 'carbs'))} · F {grams(sumFoods([meal], 'fat'))}
            </p>

            <FoodList foods={meal.foods} />
            <Link to={`/meal/${meal.id}`} className={styles.recipeLink}>
              Recipe
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
