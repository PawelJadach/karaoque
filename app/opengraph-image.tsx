import { ImageResponse } from "next/og";
import { BrandIcon } from "../lib/brandIcon";

export const alt = "Karaoque — wspólna lista piosenek na karaoke";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: 80,
          background:
            "linear-gradient(145deg, #2a0f24 0%, #120814 45%, #1a1030 100%)",
          color: "#fdf7ff",
        }}
      >
        <BrandIcon size={180} transparent />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 48,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            Karaoque
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#c4b0cf",
              marginTop: 18,
            }}
          >
            Wspólna lista piosenek na karaoke
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
