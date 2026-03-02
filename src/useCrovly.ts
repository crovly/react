import { useState, useCallback, useRef, useEffect } from "react";
import { loadCrovlyScript, getCrovlyGlobal } from "./script-loader";
import type {
  CrovlyErrorCode,
  CrovlyWidgetInstance,
  UseCrovlyOptions,
  UseCrovlyReturn,
} from "./types";

/**
 * React hook for programmatic Crovly captcha control.
 *
 * Returns reactive state (`token`, `error`, `isLoading`) and a `reset` function.
 * You must render the returned `containerRef` into a DOM element.
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { token, error, isLoading, reset, containerRef } = useCrovly({
 *     siteKey: "crvl_site_xxx",
 *     theme: "dark",
 *   });
 *
 *   return (
 *     <form>
 *       <div ref={containerRef} />
 *       <button type="submit" disabled={!token}>Submit</button>
 *       {error && <p>Error: {error.message}</p>}
 *     </form>
 *   );
 * }
 * ```
 */
export function useCrovly(
  options: UseCrovlyOptions
): UseCrovlyReturn & { containerRef: React.RefObject<HTMLDivElement | null> } {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<{
    code: CrovlyErrorCode;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<CrovlyWidgetInstance | null>(null);

  const {
    siteKey,
    theme = "auto",
    size = "normal",
    lang,
    badge = true,
    responseFieldName = "crovly-token",
  } = options;

  const initWidget = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    setToken(null);
    setError(null);
    setIsLoading(true);

    try {
      await loadCrovlyScript();
    } catch (err) {
      setError({
        code: "NETWORK_ERROR",
        message:
          err instanceof Error ? err.message : "Failed to load Crovly script",
      });
      setIsLoading(false);
      return;
    }

    const crovly = getCrovlyGlobal();
    if (!crovly) {
      setError({
        code: "UNKNOWN",
        message: "Crovly global not found after script load",
      });
      setIsLoading(false);
      return;
    }

    // Clean up previous instance
    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }

    const widget = crovly.render(container, {
      siteKey,
      theme,
      size,
      lang,
      badge,
      responseFieldName,
      onVerify: (t: string) => {
        setToken(t);
        setError(null);
        setIsLoading(false);
      },
      onError: (code: string, message: string) => {
        setToken(null);
        setError({ code: code as CrovlyErrorCode, message });
        setIsLoading(false);
      },
      onExpire: () => {
        setToken(null);
        setError(null);
        setIsLoading(true);
      },
    });

    widgetRef.current = widget;
  }, [siteKey, theme, size, lang, badge, responseFieldName]);

  // Initialize on mount and when config changes
  useEffect(() => {
    initWidget();

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [initWidget]);

  const reset = useCallback(() => {
    if (widgetRef.current) {
      widgetRef.current.reset();
      setToken(null);
      setError(null);
      setIsLoading(true);
    } else {
      // Widget not initialized yet, re-init
      initWidget();
    }
  }, [initWidget]);

  return { token, error, isLoading, reset, containerRef };
}
