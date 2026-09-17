import { ImageResponse } from "next/og";
import { BrandIcon } from "../../lib/brandIcon";

export function GET() {
  return new ImageResponse(<BrandIcon size={192} padded />, {
    width: 192,
    height: 192,
  });
}
