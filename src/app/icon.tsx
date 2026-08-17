import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#191e3b",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "28px",
          }}
        >
          <svg width="240" height="200" viewBox="0 0 100 84" fill="none">
            <path
              d="M4 80 L36 16 L54 44 L66 28 L96 80 Z"
              fill="#77e1fb"
            />
            <path
              d="M36 16 L42 28 L54 44 L66 28 L72 40 L96 80 L54 80 Z"
              fill="#0f51ec"
            />
            <path
              d="M42 28 L54 44 L66 28 L60 38 L54 44 L48 38 Z"
              fill="#77e1fb"
            />
          </svg>
          <div
            style={{
              display: "flex",
              fontSize: "44px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Chalet Express
          </div>
        </div>
      </div>
    ),
    size
  );
}