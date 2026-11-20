import { useState, type FormEvent, type ReactNode } from 'react';
import {
  ACTIVITY_LEVELS,
  BUDGET_LEVELS,
  type ActivityLevel,
  type BudgetLevel,
  type DietaryPreference,
  type DietProfileValues,
  type Sex,
} from '../../services/dietProfileService';
import {
  cmToFeetInches,
  cmToInches,
  inchesToFeetInches,
  feetInchesToCm,
  kgToLb,
  lbToKg,
  parseNumber,
  type HeightUnit,
  type WeightUnit,
} from '../../utils/units';
import styles from './DietProfileForm.module.css';

interface DietProfileFormProps {
  onSubmit: (values: DietProfileValues) => Promise<void> | void;
  /** Existing profile (metric) to edit. Omit when creating a new one. */
  initialValues?: DietProfileValues;
  submitLabel: string;
  submittingLabel: string;
}

type FieldName = 'age' | 'sex' | 'weight' | 'height' | 'activityLevel' | 'budgetLevel';
type FieldErrors = Partial<Record<FieldName, string>>;

// Limits are checked in metric, after conversion, so both unit systems share one rule
const AGE_MIN = 18;
const AGE_MAX = 100;
const WEIGHT_KG_MIN = 30;
const WEIGHT_KG_MAX = 300;
const HEIGHT_CM_MIN = 120;
const HEIGHT_CM_MAX = 230;

const SEX_CHOICES: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, { label: string; hint: string }> = {
  sedentary: { label: 'Sedentary', hint: 'Little or no exercise' },
  light: { label: 'Light', hint: 'Exercise 1–3 days a week' },
  moderate: { label: 'Moderate', hint: 'Exercise 3–5 days a week' },
  active: { label: 'Active', hint: 'Exercise 6–7 days a week' },
  'very active': { label: 'Very active', hint: 'Hard daily exercise or a physical job' },
};

const BUDGET_DESCRIPTIONS: Record<BudgetLevel, { label: string; hint: string }> = {
  Minimal: { label: 'Minimal', hint: 'Keep grocery costs as low as possible' },
  Normal: { label: 'Normal', hint: 'A balance of cost and variety' },
  Premium: { label: 'Premium', hint: 'Higher-end ingredients are fine' },
};

// 'Normal' means no restriction, so it isn't a checkbox: it's sent when none are checked
const RESTRICTION_CHOICES: { value: Exclude<DietaryPreference, 'Normal'>; label: string }[] = [
  { value: 'High Protein', label: 'High protein' },
  { value: 'Keto', label: 'Keto' },
  { value: 'Vegetarian', label: 'Vegetarian' },
  { value: 'Vegan', label: 'Vegan' },
];

function toText(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

export function DietProfileForm({
  onSubmit,
  initialValues,
  submitLabel,
  submittingLabel,
}: Readonly<DietProfileFormProps>) {
  // US-based app: start in pounds and feet/inches. Stored values are always metric.
  const initialHeight = initialValues ? cmToFeetInches(initialValues.height) : undefined;

  const [age, setAge] = useState(toText(initialValues?.age));
  const [sex, setSex] = useState<Sex | ''>(initialValues?.sex ?? '');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lb');
  const [weight, setWeight] = useState(
    initialValues ? toText(kgToLb(initialValues.weight)) : ''
  );
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('ftin');
  const [heightCm, setHeightCm] = useState(toText(initialValues?.height));
  const [feet, setFeet] = useState(toText(initialHeight?.feet));
  const [inches, setInches] = useState(toText(initialHeight?.inches));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>(
    initialValues?.activityLevel ?? ''
  );
  const [restrictions, setRestrictions] = useState<DietaryPreference[]>(
    (initialValues?.dietaryPreferences ?? []).filter((pref) => pref !== 'Normal')
  );
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel | ''>(
    initialValues?.budgetLevel ?? ''
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Weight in kg, or null if the field is empty or not a number. */
  const weightKg = (): number | null => {
    const value = parseNumber(weight);
    if (value === null) return null;
    return weightUnit === 'kg' ? value : lbToKg(value);
  };

  /** Height in cm, or null if incomplete. Inches may be left blank (treated as 0). */
  const heightInCm = (): number | null => {
    if (heightUnit === 'cm') return parseNumber(heightCm);
    const ft = parseNumber(feet);
    const inch = inches.trim() === '' ? 0 : parseNumber(inches);
    if (ft === null || inch === null || inch < 0 || inch >= 12) return null;
    return feetInchesToCm(ft, inch);
  };

  // Switching units converts whatever is already typed, so nothing is lost
  const changeWeightUnit = (next: WeightUnit) => {
    if (next === weightUnit) return;
    const value = parseNumber(weight);
    if (value !== null) {
      setWeight(String(next === 'kg' ? lbToKg(value) : kgToLb(value)));
    }
    setWeightUnit(next);
  };

  const changeHeightUnit = (next: HeightUnit) => {
    if (next === heightUnit) return;
    const cm = heightInCm();
    if (cm !== null) {
      if (next === 'cm') {
        setHeightCm(String(cm));
      } else {
        const converted = cmToFeetInches(cm);
        setFeet(String(converted.feet));
        setInches(String(converted.inches));
      }
    }
    setHeightUnit(next);
  };

  const toggleRestriction = (value: DietaryPreference) => {
    setRestrictions((current) =>
      current.includes(value) ? current.filter((pref) => pref !== value) : [...current, value]
    );
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    const ageValue = parseNumber(age);
    if (ageValue === null || !Number.isInteger(ageValue) || ageValue < AGE_MIN || ageValue > AGE_MAX) {
      errors.age = `Please enter a whole number between ${AGE_MIN} and ${AGE_MAX}.`;
    }

    if (!sex) errors.sex = 'Please choose one.';

    const kg = weightKg();
    if (kg === null || kg < WEIGHT_KG_MIN || kg > WEIGHT_KG_MAX) {
      errors.weight =
        weightUnit === 'kg'
          ? `Please enter a weight between ${WEIGHT_KG_MIN} and ${WEIGHT_KG_MAX} kg.`
          : `Please enter a weight between ${Math.ceil(kgToLb(WEIGHT_KG_MIN))} and ${Math.floor(kgToLb(WEIGHT_KG_MAX))} lb.`;
    }

    const cm = heightInCm();
    if (cm === null || cm < HEIGHT_CM_MIN || cm > HEIGHT_CM_MAX) {
      if (heightUnit === 'cm') {
        errors.height = `Please enter a height between ${HEIGHT_CM_MIN} and ${HEIGHT_CM_MAX} cm.`;
      } else {
        // Round inward so every height the message allows also passes the check
        const min = inchesToFeetInches(Math.ceil(cmToInches(HEIGHT_CM_MIN)));
        const max = inchesToFeetInches(Math.floor(cmToInches(HEIGHT_CM_MAX)));
        errors.height = `Please enter a height between ${min.feet}′${min.inches}″ and ${max.feet}′${max.inches}″ (inches 0–11).`;
      }
    }

    if (!activityLevel) errors.activityLevel = 'Please choose your activity level.';
    if (!budgetLevel) errors.budgetLevel = 'Please choose a budget.';

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // validate() guarantees these are set; the checks narrow the types
    const kg = weightKg();
    const cm = heightInCm();
    if (kg === null || cm === null || !sex || !activityLevel || !budgetLevel) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        age: Number(age),
        sex,
        weight: kg,
        height: cm,
        activityLevel,
        dietaryPreferences: restrictions.length > 0 ? restrictions : ['Normal'],
        budgetLevel,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: FieldName) =>
    fieldErrors[field] ? `${styles.input} ${styles.inputError}` : styles.input;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="age" className={styles.label}>Age</label>
        <input
          id="age"
          type="number"
          inputMode="numeric"
          min={AGE_MIN}
          max={AGE_MAX}
          className={`${inputClass('age')} ${styles.shortInput}`}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          aria-invalid={Boolean(fieldErrors.age)}
          aria-describedby={fieldErrors.age ? 'age-error' : undefined}
        />
        <FieldError id="age-error" message={fieldErrors.age} />
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Sex</legend>
        <p className={styles.hint}>Used to estimate your calorie needs.</p>
        <div className={styles.segmented}>
          {SEX_CHOICES.map((choice) => (
            <label key={choice.value} className={styles.segment}>
              <input
                type="radio"
                name="sex"
                value={choice.value}
                checked={sex === choice.value}
                onChange={() => setSex(choice.value)}
                className={styles.visuallyHidden}
              />
              {choice.label}
            </label>
          ))}
        </div>
        <FieldError message={fieldErrors.sex} />
      </fieldset>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="weight" className={styles.label}>Weight</label>
          <UnitToggle
            name="weightUnit"
            label="Weight unit"
            value={weightUnit}
            options={[
              { value: 'lb', label: 'lb' },
              { value: 'kg', label: 'kg' },
            ]}
            onChange={changeWeightUnit}
          />
        </div>
        <div className={styles.inputWithSuffix}>
          <input
            id="weight"
            type="number"
            inputMode="decimal"
            step="0.1"
            className={`${inputClass('weight')} ${styles.shortInput}`}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            aria-invalid={Boolean(fieldErrors.weight)}
            aria-describedby={fieldErrors.weight ? 'weight-error' : undefined}
          />
          <span className={styles.suffix}>{weightUnit}</span>
        </div>
        <FieldError id="weight-error" message={fieldErrors.weight} />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <span className={styles.label} id="height-label">Height</span>
          <UnitToggle
            name="heightUnit"
            label="Height unit"
            value={heightUnit}
            options={[
              { value: 'ftin', label: 'ft / in' },
              { value: 'cm', label: 'cm' },
            ]}
            onChange={changeHeightUnit}
          />
        </div>
        {heightUnit === 'cm' ? (
          <div className={styles.inputWithSuffix}>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              aria-labelledby="height-label"
              className={`${inputClass('height')} ${styles.shortInput}`}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              aria-invalid={Boolean(fieldErrors.height)}
              aria-describedby={fieldErrors.height ? 'height-error' : undefined}
            />
            <span className={styles.suffix}>cm</span>
          </div>
        ) : (
          <div className={styles.feetInchesRow}>
            <div className={styles.inputWithSuffix}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                aria-label="Height, feet"
                className={`${inputClass('height')} ${styles.tinyInput}`}
                value={feet}
                onChange={(e) => setFeet(e.target.value)}
                aria-invalid={Boolean(fieldErrors.height)}
                aria-describedby={fieldErrors.height ? 'height-error' : undefined}
              />
              <span className={styles.suffix}>ft</span>
            </div>
            <div className={styles.inputWithSuffix}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={11}
                aria-label="Height, inches"
                className={`${inputClass('height')} ${styles.tinyInput}`}
                value={inches}
                onChange={(e) => setInches(e.target.value)}
                aria-invalid={Boolean(fieldErrors.height)}
                aria-describedby={fieldErrors.height ? 'height-error' : undefined}
              />
              <span className={styles.suffix}>in</span>
            </div>
          </div>
        )}
        <FieldError id="height-error" message={fieldErrors.height} />
      </div>

      <OptionGroup legend="Activity level" error={fieldErrors.activityLevel}>
        {ACTIVITY_LEVELS.map((level) => (
          <label key={level} className={styles.option}>
            <input
              type="radio"
              name="activityLevel"
              value={level}
              checked={activityLevel === level}
              onChange={() => setActivityLevel(level)}
              className={styles.optionInput}
            />
            <span>
              <span className={styles.optionLabel}>{ACTIVITY_DESCRIPTIONS[level].label}</span>
              <span className={styles.optionHint}>{ACTIVITY_DESCRIPTIONS[level].hint}</span>
            </span>
          </label>
        ))}
      </OptionGroup>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Dietary preferences</legend>
        <p className={styles.hint}>Choose any that apply, or leave them all unchecked for no restrictions.</p>
        <div className={styles.chips}>
          {RESTRICTION_CHOICES.map((choice) => (
            <label key={choice.value} className={styles.chip}>
              <input
                type="checkbox"
                checked={restrictions.includes(choice.value)}
                onChange={() => toggleRestriction(choice.value)}
                className={styles.visuallyHidden}
              />
              {choice.label}
            </label>
          ))}
        </div>
      </fieldset>

      <OptionGroup legend="Grocery budget" error={fieldErrors.budgetLevel}>
        {BUDGET_LEVELS.map((level) => (
          <label key={level} className={styles.option}>
            <input
              type="radio"
              name="budgetLevel"
              value={level}
              checked={budgetLevel === level}
              onChange={() => setBudgetLevel(level)}
              className={styles.optionInput}
            />
            <span>
              <span className={styles.optionLabel}>{BUDGET_DESCRIPTIONS[level].label}</span>
              <span className={styles.optionHint}>{BUDGET_DESCRIPTIONS[level].hint}</span>
            </span>
          </label>
        ))}
      </OptionGroup>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}

function FieldError({ id, message }: Readonly<{ id?: string; message?: string }>) {
  if (!message) return null;
  return (
    <span id={id} className={styles.errorText}>
      {message}
    </span>
  );
}

function OptionGroup({
  legend,
  error,
  children,
}: Readonly<{ legend: string; error?: string; children: ReactNode }>) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.optionList}>{children}</div>
      <FieldError message={error} />
    </fieldset>
  );
}

interface UnitToggleProps<T extends string> {
  name: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function UnitToggle<T extends string>({ name, label, value, options, onChange }: Readonly<UnitToggleProps<T>>) {
  return (
    <div role="radiogroup" aria-label={label} className={styles.unitToggle}>
      {options.map((option) => (
        <label key={option.value} className={styles.unitOption}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className={styles.visuallyHidden}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
