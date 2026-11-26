import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FoodList } from '../../components/FoodList/FoodList';
import { PageStatus } from '../../components/PageStatus/PageStatus';
import { useLatestPlan } from '../../queries/useLatestPlan';
import { useRecipe } from '../../queries/useRecipe';
import type { MealName } from '../../services/types';
import { formatGrams, sumFoods } from '../../utils/nutrition';
import styles from './MealDetailPage.module.css';

const MEAL_LABELS: Record<MealName, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** One meal from the saved plan, with an on-demand recipe. */
export function MealDetailPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const { data: savedPlan } = useLatestPlan();
  const meal = savedPlan?.mealPlan.meals.find((m) => m.id === mealId);

  const [requested, setRequested] = useState(false);
  const recipeQuery = useRecipe(meal, requested);

  // Go back to wherever the user came from, or home if they opened this address directly
  const goBack = () => {
    const state = window.history.state as { idx?: number } | null;
    if (state?.idx) {
      void navigate(-1);
    } else {
      void navigate('/dashboard');
    }
  };

  if (!meal) {
    return (
      <div className={styles.page}>
        <PageStatus title="Meal not found" message="That meal isn't in your current plan." isError>
          <Link to="/plan" className={styles.linkButton}>
            Back to your meal plan
          </Link>
        </PageStatus>
      </div>
    );
  }

  const recipe = recipeQuery.data;
  const isBuilding = recipeQuery.isFetching && !recipe;

  const renderRecipe = () => {
    if (recipe) {
      return (
        <section className={styles.card} aria-labelledby="recipe-heading">
          <h2 id="recipe-heading" className={styles.recipeTitle}>
            {recipe.title}
          </h2>
          <p className={styles.recipeMeta}>
            Serves {recipe.servings} · Prep {recipe.prepTime} min · Cook {recipe.cookTime} min
          </p>
          {recipe.estimatedTotalCost !== undefined && (
            <p className={styles.recipeMeta}>
              Estimated cost {currency.format(recipe.estimatedTotalCost)} (AI estimate, not a store price)
            </p>
          )}
          <p className={styles.description}>{recipe.description}</p>

          <h3 className={styles.subheading}>Ingredients</h3>
          <ul className={styles.ingredients}>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={`${ingredient.name}-${index}`} className={styles.ingredient}>
                <span>{ingredient.display}</span>
                {ingredient.estimatedCost !== undefined && ingredient.estimatedCost > 0 && (
                  <span className={styles.cost}>~{currency.format(ingredient.estimatedCost)}</span>
                )}
              </li>
            ))}
          </ul>

          <h3 className={styles.subheading}>Directions</h3>
          <ol className={styles.directions}>
            {recipe.directions.map((step, index) => (
              <li key={`${index}-${step.slice(0, 20)}`}>{step}</li>
            ))}
          </ol>
        </section>
      );
    }

    if (isBuilding) {
      return (
        <PageStatus
          title="Building your recipe"
          message="This usually takes a few seconds. Please keep this page open."
          busy
        />
      );
    }

    if (recipeQuery.isError) {
      return (
        <PageStatus title="We couldn't build that recipe" message={recipeQuery.error.message} isError>
          <button type="button" className={styles.primaryButton} onClick={() => void recipeQuery.refetch()}>
            Try again
          </button>
        </PageStatus>
      );
    }

    return (
      <div className={styles.recipePrompt}>
        <p className={styles.note}>
          Get step-by-step directions and an ingredient list for this meal.
        </p>
        <button type="button" className={styles.primaryButton} onClick={() => setRequested(true)}>
          Show recipe
        </button>
      </div>
    );
  };

  const price = meal.price;

  return (
    <div className={styles.page}>
      <button type="button" className={styles.backButton} onClick={goBack}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back
      </button>

      <section className={styles.card} aria-labelledby="meal-heading">
        {meal.image && <img src={meal.image} alt="" className={styles.image} />}
        <div className={styles.body}>
          <div className={styles.header}>
            <h1 id="meal-heading" className={styles.title}>
              {MEAL_LABELS[meal.name]}
            </h1>
            {price !== undefined && <span className={styles.price}>Est. {currency.format(price)}</span>}
          </div>
          <p className={styles.meta}>
            {sumFoods([meal], 'calories')} cal · P {formatGrams(sumFoods([meal], 'protein'))} · C{' '}
            {formatGrams(sumFoods([meal], 'carbs'))} · F {formatGrams(sumFoods([meal], 'fat'))}
          </p>
          <FoodList foods={meal.foods} />
        </div>
      </section>

      {renderRecipe()}
    </div>
  );
}
