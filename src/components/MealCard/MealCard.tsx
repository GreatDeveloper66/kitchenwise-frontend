import styles from './MealCard.module.css';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  mealType: MealType;
  imageUrl?: string;
}

interface MealCardProps {
  meal: Meal;
  onSelect?: (meal: Meal) => void;
}

export function MealCard({ meal, onSelect }: Readonly<MealCardProps>) {
  return (
    <button type="button" className={styles.card} onClick={() => onSelect?.(meal)}>
      <div
        className={styles.image}
        style={meal.imageUrl ? { backgroundImage: `url(${meal.imageUrl})` } : undefined}
        role="img"
        aria-label={meal.imageUrl ? meal.name : 'No photo yet'}
      />
      <div className={styles.info}>
        <p className={styles.name}>{meal.name}</p>
        <p className={styles.meta}>
          {meal.calories} cal · {meal.mealType}
        </p>
      </div>
    </button>
  );
}