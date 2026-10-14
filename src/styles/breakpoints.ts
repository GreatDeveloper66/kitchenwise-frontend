// Keep these values in sync with the pixel values used in
// src/styles/theme.css media queries — these can't be read
// from CSS custom properties since @media queries don't support var().

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Convenience media query strings, for use with libraries like
// `window.matchMedia` or a custom hook (see useMediaQuery below).
export const MEDIA_QUERIES = {
  tablet: `(min-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  wide: `(min-width: ${BREAKPOINTS.wide}px)`,
} as const;