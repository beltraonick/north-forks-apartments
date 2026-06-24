import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        fontFamily:
          "-apple-system, 'SF Pro Display', 'SF Pro Text', Inter, sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#1c1c1e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "36px 32px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#2c2c2e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: 22,
            }}
          >
            🏢
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: "#f5f5f7",
              letterSpacing: -0.3,
            }}
          >
            North Fork Apartments
          </div>
          <div style={{ fontSize: 13, color: "#98989d", marginTop: 4 }}>
            Manager &amp; Admin Login
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(255,69,58,0.1)",
              border: "1px solid rgba(255,69,58,0.25)",
              color: "#ff453a",
              fontSize: 13,
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        <form action={login}>
          <label
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "#98989d",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              display: "block",
              marginBottom: 7,
            }}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@northfork.com"
            style={{
              width: "100%",
              background: "#1c1c1e",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "13px 15px",
              color: "#f5f5f7",
              fontSize: 15,
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "#98989d",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              display: "block",
              marginBottom: 7,
            }}
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={{
              width: "100%",
              background: "#1c1c1e",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "13px 15px",
              color: "#f5f5f7",
              fontSize: 15,
              marginBottom: 24,
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 14,
              border: "none",
              background: "#0a84ff",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#636366",
            marginTop: 22,
          }}
        >
          Authorized personnel only.
        </div>
      </div>
    </div>
  );
}
