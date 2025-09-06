import {
  Location,
  GeolocationError,
  GEOLOCATION_ERRORS,
} from "@/features/search/types";

export class LocationService {
  private static instance: LocationService;
  private currentLocation: Location | null = null;
  private watchId: number | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check if geolocation is supported by the browser
   */
  isSupported(): boolean {
    return "geolocation" in navigator;
  }

  /**
   * Get current location with permission request
   */
  async getCurrentLocation(options?: PositionOptions): Promise<Location> {
    if (!this.isSupported()) {
      throw new Error("Geolocation is not supported by this browser");
    }

    return new Promise((resolve, reject) => {
      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          const geolocationError: GeolocationError = {
            code: error.code,
            message: this.getErrorMessage(error.code),
          };
          reject(geolocationError);
        },
        defaultOptions
      );
    });
  }

  /**
   * Watch location changes
   */
  watchLocation(
    onSuccess: (location: Location) => void,
    onError: (error: GeolocationError) => void,
    options?: PositionOptions
  ): number {
    if (!this.isSupported()) {
      onError({
        code: GEOLOCATION_ERRORS.POSITION_UNAVAILABLE,
        message: "Geolocation is not supported by this browser",
      });
      return -1;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
      ...options,
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        this.currentLocation = location;
        onSuccess(location);
      },
      (error) => {
        const geolocationError: GeolocationError = {
          code: error.code,
          message: this.getErrorMessage(error.code),
        };
        onError(geolocationError);
      },
      defaultOptions
    );

    return this.watchId;
  }

  /**
   * Stop watching location
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get cached location
   */
  getCachedLocation(): Location | null {
    return this.currentLocation;
  }

  /**
   * Clear cached location
   */
  clearCachedLocation(): void {
    this.currentLocation = null;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get error message for geolocation error code
   */
  private getErrorMessage(code: number): string {
    switch (code) {
      case GEOLOCATION_ERRORS.PERMISSION_DENIED:
        return "Location access denied by user. Please enable location permissions in your browser settings.";
      case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
        return "Location information is unavailable. Please check your internet connection and try again.";
      case GEOLOCATION_ERRORS.TIMEOUT:
        return "Location request timed out. Please try again.";
      default:
        return "An unknown error occurred while retrieving location.";
    }
  }

  /**
   * Request location permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      // Try to get current position to trigger permission request
      await this.getCurrentLocation({ timeout: 1000 });
      return true;
    } catch (error) {
      const geolocationError = error as GeolocationError;
      return geolocationError.code !== GEOLOCATION_ERRORS.PERMISSION_DENIED;
    }
  }

  /**
   * Check if location permission is granted
   */
  async checkPermission(): Promise<PermissionState> {
    if (!("permissions" in navigator)) {
      // Fallback for browsers that don't support Permissions API
      try {
        await this.getCurrentLocation({ timeout: 1000 });
        return "granted";
      } catch (error) {
        const geolocationError = error as GeolocationError;
        return geolocationError.code === GEOLOCATION_ERRORS.PERMISSION_DENIED
          ? "denied"
          : "prompt";
      }
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
      return permission.state;
    } catch (error) {
      console.error("Error checking permission:", error);
      return "prompt";
    }
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();

// Utility functions
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};

export const formatLocation = (location: Location): string => {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
};
