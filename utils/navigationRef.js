/**
 * Global Navigation Reference
 * Allows navigation from anywhere in the app, including outside React components
 */
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.log('Navigation not ready yet, will retry...');
    setTimeout(() => navigate(name, params), 100);
  }
}

export function reset(routes) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: routes,
    });
  } else {
    console.log('Navigation not ready yet, will retry...');
    setTimeout(() => reset(routes), 100);
  }
}

