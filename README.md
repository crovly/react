# @crovly/react

Official React SDK for [Crovly](https://crovly.com) — privacy-first, Proof of Work captcha.

## Installation

```bash
npm install @crovly/react
```

React 18+ is required as a peer dependency.

## Component Usage

```tsx
import { CrovlyCaptcha } from "@crovly/react";

function ContactForm() {
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send token to your backend for verification
    await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />

      <CrovlyCaptcha
        siteKey="crvl_site_xxx"
        theme="dark"
        onVerify={(token) => setToken(token)}
        onError={(code, msg) => console.error("Captcha error:", code, msg)}
        onExpire={() => setToken(null)}
      />

      <button type="submit" disabled={!token}>
        Submit
      </button>
    </form>
  );
}
```

## Hook Usage

The `useCrovly` hook gives you reactive state and a ref to attach to a container element.

```tsx
import { useCrovly } from "@crovly/react";

function LoginForm() {
  const { token, error, isLoading, reset, containerRef } = useCrovly({
    siteKey: "crvl_site_xxx",
    theme: "auto",
  });

  return (
    <form>
      <input name="username" />
      <input name="password" type="password" />

      <div ref={containerRef} />

      {error && <p className="text-red-500">Error: {error.message}</p>}

      <button type="submit" disabled={isLoading || !token}>
        {isLoading ? "Verifying..." : "Log in"}
      </button>

      <button type="button" onClick={reset}>
        Reset Captcha
      </button>
    </form>
  );
}
```

## Next.js App Router

Since Crovly requires browser APIs, use dynamic import with SSR disabled:

```tsx
// components/Captcha.tsx
"use client";

import dynamic from "next/dynamic";

const CrovlyCaptcha = dynamic(
  () => import("@crovly/react").then((mod) => mod.CrovlyCaptcha),
  { ssr: false }
);

export default function Captcha({
  onVerify,
}: {
  onVerify: (token: string) => void;
}) {
  return (
    <CrovlyCaptcha
      siteKey={process.env.NEXT_PUBLIC_CROVLY_SITE_KEY!}
      theme="auto"
      onVerify={onVerify}
    />
  );
}
```

## Props Reference

### `<CrovlyCaptcha />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `siteKey` | `string` | **required** | Your site key from the Crovly dashboard |
| `theme` | `"light" \| "dark" \| "auto"` | `"auto"` | Color theme |
| `size` | `"normal" \| "invisible"` | `"normal"` | Widget visibility mode |
| `lang` | `string` | - | Language code (e.g. `"en"`, `"tr"`) |
| `badge` | `boolean` | `true` | Show "Protected by Crovly" badge |
| `responseFieldName` | `string` | `"crovly-token"` | Hidden form field name |
| `onVerify` | `(token: string) => void` | - | Called on successful verification |
| `onError` | `(code: string, message: string) => void` | - | Called on verification failure |
| `onExpire` | `() => void` | - | Called when token expires |
| `onFallback` | `(fallbackToken: string) => void` | - | Called when service is unreachable after retries |
| `className` | `string` | - | CSS class on the wrapper div |
| `id` | `string` | - | HTML id on the wrapper div |

### `useCrovly(options)`

Returns `{ token, error, isLoading, reset, containerRef }`.

| Return | Type | Description |
|--------|------|-------------|
| `token` | `string \| null` | Verification token |
| `error` | `{ code: string; message: string } \| null` | Error details |
| `isLoading` | `boolean` | Loading/verifying state |
| `reset` | `() => void` | Reset and re-verify |
| `containerRef` | `React.RefObject` | Attach to a `<div>` element |

## Backend Verification

After obtaining the token, verify it on your server:

```javascript
const res = await fetch("https://api.crovly.com/verify-token", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_SECRET_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ token, expectedIp: req.ip }),
});
const { success, score } = await res.json();
```

## Documentation

Full documentation at [docs.crovly.com](https://docs.crovly.com).

## License

MIT
