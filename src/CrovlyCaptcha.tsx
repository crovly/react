import { useRef, useEffect } from "react";
import { loadCrovlyScript, getCrovlyGlobal } from "./script-loader";
import type { CrovlyCaptchaProps, CrovlyWidgetInstance, CrovlyErrorCode } from "./types";

/**
 * React component that renders a Crovly captcha widget.
 *
 * @example
 * ```tsx
 * <CrovlyCaptcha
 *   siteKey="crvl_site_xxx"
 *   theme="dark"
 *   onVerify={(token) => setToken(token)}
 *   onError={(code, msg) => console.error(code, msg)}
 * />
 * ```
 */
export function CrovlyCaptcha({
  siteKey,
  theme = "auto",
  size = "normal",
  lang,
  badge = true,
  responseFieldName = "crovly-token",
  onVerify,
  onError,
  onExpire,
  className,
  id,
}: CrovlyCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<CrovlyWidgetInstance | null>(null);

  // Store callbacks in refs so the widget always calls the latest version
  // without needing to re-create the widget on every render.
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const init = async () => {
      try {
        await loadCrovlyScript();
      } catch (err) {
        if (!cancelled) {
          onErrorRef.current?.(
            "NETWORK_ERROR",
            err instanceof Error ? err.message : "Failed to load Crovly script"
          );
        }
        return;
      }

      if (cancelled) return;

      const crovly = getCrovlyGlobal();
      if (!crovly) {
        onErrorRef.current?.(
          "UNKNOWN",
          "Crovly global not found after script load"
        );
        return;
      }

      // Clean up any previous widget on this container
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
        onVerify: (token: string) => onVerifyRef.current?.(token),
        onError: (code: string, message: string) =>
          onErrorRef.current?.(code as CrovlyErrorCode, message),
        onExpire: () => onExpireRef.current?.(),
      });

      if (!cancelled) {
        widgetRef.current = widget;
      } else {
        widget.remove();
      }
    };

    init();

    return () => {
      cancelled = true;
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
    // Re-initialize when these config props change
  }, [siteKey, theme, size, lang, badge, responseFieldName]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={className}
    />
  );
}

CrovlyCaptcha.displayName = "CrovlyCaptcha";
