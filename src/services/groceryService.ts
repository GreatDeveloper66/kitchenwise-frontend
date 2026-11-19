// Client for kitchenwise-grocery-service (Google Places). Route: api/find-grocery-markets-within-radius.ts.
// No auth. Responses are { status, statusText, places }, and `status` matches the HTTP status.
import { groceryApi, toApiError } from './api';

export const MAX_RADIUS_METERS = 50_000;

export interface FindStoresRequest {
  latitude: number;
  longitude: number;
  /** Meters, greater than 0 and at most 50,000. */
  radius: number;
}

export interface StorePhoto {
  /** Short-lived Google URL: display it, don't store it. */
  url: string;
  name: string;
  width: number;
  height: number;
  attributions?: { displayName?: string; uri?: string; photoUri?: string }[];
  googleMapsUri?: string;
}

export interface StoreHoursStatus {
  isOpen: boolean;
  message: string;
  hoursUntilClose?: number | null;
  hoursUntilOpen?: number | null;
  nextCloseTime?: string | null;
  nextOpenTime?: string | null;
}

export interface GroceryStore {
  placeId: string;
  name: string;
  displayName?: { text: string; languageCode?: string };
  latitude?: number;
  longitude?: number;
  types?: string[];
  formattedAddress?: string;
  businessStatus?: string;
  /** Raw Google Places opening hours objects. */
  regularOpeningHours?: unknown;
  currentOpeningHours?: unknown;
  rating?: number;
  userRatingCount?: number;
  /** At most one photo per store. */
  photos: StorePhoto[];
  photoCount: number;
  priceLevel?: string;
  phoneNumber?: string;
  website?: string;
  hoursStatus: StoreHoursStatus;
}

interface FindStoresResponse {
  status: number;
  statusText: string;
  places: GroceryStore[];
}

/** Up to 10 supermarkets and grocery stores within `radius` meters. */
export async function findGroceryStores(request: FindStoresRequest): Promise<GroceryStore[]> {
  try {
    const { data } = await groceryApi.post<FindStoresResponse>(
      '/find-grocery-markets-within-radius',
      request
    );
    return data.places;
  } catch (err) {
    throw toApiError(err, 'Could not find grocery stores nearby.');
  }
}
