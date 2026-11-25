import type { FoodItem } from '../../services/types';
import { formatGrams } from '../../utils/nutrition';
import styles from './FoodList.module.css';

/** The foods in a meal, each with quantity, calories, and macros. */
export function FoodList({ foods }: Readonly<{ foods: FoodItem[] }>) {
  return (
    <ul className={styles.foods}>
      {foods.map((food) => (
        <li key={food.id} className={styles.food}>
          <div>
            <p className={styles.foodName}>{food.name}</p>
            {food.quantity && <p className={styles.foodDetail}>{food.quantity}</p>}
          </div>
          <div className={styles.foodNumbers}>
            <p className={styles.foodCalories}>{Math.round(food.calories)} cal</p>
            <p className={styles.foodDetail}>
              P {formatGrams(food.protein)} · C {formatGrams(food.carbs)} · F {formatGrams(food.fat)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
