import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <svg width="150" height="126" viewBox="0 0 100 84" fill="none">
          <path d="M4 80 L36 16 L54 44 L66 28 L96 80 Z" fill="#77e1fb" />
          <path
            d="M36 16 L42 28 L54 44 L66 28 L72 40 L96 80 L54 80 Z"
            fill="#0f51ec"
          />
          <path
            d="M42 28 L54 44 L66 28 L60 38 L54 44 L48 38 Z"
            fill="#77e1fb"
          />
        </svg>
      </div>
    ),
    size
  );
}