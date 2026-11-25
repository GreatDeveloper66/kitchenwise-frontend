import { CalorieSummary } from '../../components/CalorieSummary/CalorieSummary';
import { MealCard, type Meal as MealCardData, type MealType } from '../../components/MealCard/MealCard';
import { PageStatus } from '../../components/PageStatus/PageStatus';
import { useAuth } from '../../hooks/useAuth';
import { useLatestPlan } from '../../queries/useLatestPlan';
import type { Meal, MealName } from '../../services/types';
import { sumFoods } from '../../utils/nutrition';
import styles from './DashboardPage.module.css';

const MEAL_TYPES: Record<MealName, MealType> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Backend meals have no dish name, only foods, so the card title is the food list. */
function toCard(meal: Meal): MealCardData {
  return {
    id: meal.id,
    name: meal.foods.map((food) => food.name).join(', ') || MEAL_TYPES[meal.name],
    calories: sumFoods([meal], 'calories'),
    mealType: MEAL_TYPES[meal.name],
    imageUrl: meal.image,
    price: meal.price,
  };
}

export function DashboardPage() {
  const firstName = useAuth().user?.firstName;
  // RequireSetup has already loaded this, so it comes straight from the cache
  const { data: savedPlan } = useLatestPlan();
  const meals = savedPlan?.mealPlan.meals ?? [];

  return (
    <div className={styles.page}>
      <p className={styles.greeting}>
        {getGreeting()}
        {firstName ? `, ${firstName}` : ''}
      </p>
      <h1 className={styles.title}>Today's plan</h1>

      {meals.length === 0 ? (
        <PageStatus message="Your meal plan has no meals yet." />
      ) : (
        <>
          {/* No intake tracking yet, so this shows the plan's totals rather than progress */}
          <CalorieSummary
            goal={sumFoods(meals, 'calories')}
            proteinGrams={sumFoods(meals, 'protein')}
            carbsGrams={sumFoods(meals, 'carbs')}
          />

          <h2 className={styles.sectionTitle}>Your meals</h2>
          <div className={styles.grid}>
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={toCard(meal)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
