import { CalorieSummary } from '../../components/CalorieSummary/CalorieSummary';
import { MealCard, type Meal } from '../../components/MealCard/MealCard';
import { getUser } from '../../services/authService';
import styles from './DashboardPage.module.css';

// TODO: replace with data from the meal plan service once it's wired up
const TODAY_MEALS: Meal[] = [
  { id: '1', name: 'Greek yogurt bowl', calories: 310, mealType: 'Breakfast' },
  { id: '2', name: 'Quinoa power bowl', calories: 460, mealType: 'Lunch' },
  { id: '3', name: 'Lemon herb salmon', calories: 520, mealType: 'Dinner' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const firstName = getUser()?.firstName;

  return (
    <div className={styles.page}>
      <p className={styles.greeting}>
        {getGreeting()}
        {firstName ? `, ${firstName}` : ''}
      </p>
      <h1 className={styles.title}>Today's plan</h1>

      <CalorieSummary consumed={1840} goal={2200} proteinGrams={92} carbsGrams={210} />

      <h2 className={styles.sectionTitle}>Your meals</h2>
      <div className={styles.grid}>
        {TODAY_MEALS.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
}