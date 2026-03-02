/** Error codes emitted by the Crovly widget. */
export type CrovlyErrorCode =
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "CHALLENGE_FAILED"
  | "VERIFICATION_FAILED"
  | "UNKNOWN";

/** Configuration accepted by the CrovlyCaptcha component. */
export interface CrovlyCaptchaProps {
  /** Your site key from the Crovly dashboard. */
  siteKey: string;
  /** Color theme. Defaults to "auto" (follows prefers-color-scheme). */
  theme?: "light" | "dark" | "auto";
  /** Widget visibility mode. "invisible" runs verification silently. */
  size?: "normal" | "invisible";
  /** Language code (e.g. "en", "tr", "ar"). */
  lang?: string;
  /** Show the "Protected by Crovly" badge. Defaults to true. */
  badge?: boolean;
  /** Name of the hidden form field that holds the token. Defaults to "crovly-token". */
  responseFieldName?: string;
  /** Called when verification succeeds with the token string. */
  onVerify?: (token: string) => void;
  /** Called when verification fails. */
  onError?: (code: CrovlyErrorCode, message: string) => void;
  /** Called when the token expires and a refresh cycle begins. */
  onExpire?: () => void;
  /** Additional CSS class name on the wrapper div. */
  className?: string;
  /** Custom id for the wrapper div. */
  id?: string;
}

/** State returned by the useCrovly hook. */
export interface UseCrovlyReturn {
  /** The verification token, or null if not yet verified. */
  token: string | null;
  /** Error info if verification failed, or null. */
  error: { code: CrovlyErrorCode; message: string } | null;
  /** True while the widget is loading or verifying. */
  isLoading: boolean;
  /** Reset the widget and start a fresh verification. */
  reset: () => void;
}

export interface UseCrovlyOptions {
  /** Your site key from the Crovly dashboard. */
  siteKey: string;
  /** Color theme. Defaults to "auto". */
  theme?: "light" | "dark" | "auto";
  /** Widget visibility mode. Defaults to "normal". */
  size?: "normal" | "invisible";
  /** Language code. */
  lang?: string;
  /** Show the "Protected by Crovly" badge. Defaults to true. */
  badge?: boolean;
  /** Name of the hidden form field. Defaults to "crovly-token". */
  responseFieldName?: string;
}

/**
 * Shape of the global Crovly namespace exposed by the IIFE widget script.
 * The script sets window.Crovly with named exports merged into the global object.
 */
export interface CrovlyGlobal {
  render: (
    selector: string | HTMLElement,
    config: { siteKey: string; [key: string]: unknown }
  ) => CrovlyWidgetInstance;
  reset: (selector: string | HTMLElement) => void;
  getResponse: (selector: string | HTMLElement) => string | null;
  remove: (selector: string | HTMLElement) => void;
}

/** Minimal interface for a CrovlyWidget instance returned by render(). */
export interface CrovlyWidgetInstance {
  reset: () => void;
  getResponse: () => string | null;
  remove: () => void;
}

declare global {
  interface Window {
    Crovly?: CrovlyGlobal & {
      default?: CrovlyGlobal;
      Crovly?: CrovlyGlobal;
      CrovlyWidget?: {
        render: (
          selector: string | HTMLElement,
          config: { siteKey: string; [key: string]: unknown }
        ) => CrovlyWidgetInstance;
      };
    };
  }
}
