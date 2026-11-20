import axios, { isAxiosError, type AxiosInstance } from 'axios';

export const TOKEN_KEY = 'kitchenwise_token';

// Each backend is its own Vercel project, so each gets its own base URL (ending in /api).
function createApiClient(baseURL: string | undefined, envName: string, withAuth: boolean): AxiosInstance {
  if (!baseURL) {
    console.warn(`${envName} is not set. Calls to this service will fail. See .env.example.`);
  }

  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  // Only the services that verify JWTs get the token; the others have no auth.
  // Simplification: the token lives in localStorage, which any script on the page can read.
  if (withAuth) {
    client.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  return client;
}

const env = import.meta.env;

export const authApi = createApiClient(env.VITE_AUTH_API_URL, 'VITE_AUTH_API_URL', true);
export const dietProfileApi = createApiClient(env.VITE_DIET_PROFILE_API_URL, 'VITE_DIET_PROFILE_API_URL', true);
export const planStorageApi = createApiClient(env.VITE_PLAN_STORAGE_API_URL, 'VITE_PLAN_STORAGE_API_URL', true);
export const mealPlanApi = createApiClient(env.VITE_MEAL_PLAN_API_URL, 'VITE_MEAL_PLAN_API_URL', false);
export const groceryApi = createApiClient(env.VITE_GROCERY_API_URL, 'VITE_GROCERY_API_URL', false);
export const recipeApi = createApiClient(env.VITE_RECIPE_API_URL, 'VITE_RECIPE_API_URL', false);

/** An Error that remembers the HTTP status, so callers can react to 401s and 404s. */
export class ApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Turns an axios error into an ApiError with the server's own message when it sent one.
 * The services disagree on the field name: user-auth, diet-profile, and plan-storage use
 * `message`; meal-plan, recipe, and plan-storage's auth check use `error`; grocery uses `statusText`.
 */
export function toApiError(err: unknown, fallback: string): ApiError {
  if (err instanceof ApiError) return err;
  if (isAxiosError(err)) {
    if (!err.response) {
      return new ApiError('Could not reach the server. Please try again.');
    }
    const data = err.response.data as
      | { message?: unknown; error?: unknown; statusText?: unknown }
      | undefined;
    const serverMessage = [data?.message, data?.error, data?.statusText].find(
      (value): value is string => typeof value === 'string' && value.length > 0
    );
    return new ApiError(serverMessage ?? fallback, err.response.status);
  }
  return new ApiError(err instanceof Error ? err.message : fallback);
}

/** HTTP status of a failed request, or undefined if it never got a response. */
export function errorStatus(err: unknown): number | undefined {
  if (err instanceof ApiError) return err.status;
  return isAxiosError(err) ? err.response?.status : undefined;
}
