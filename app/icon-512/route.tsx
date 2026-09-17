import { ImageResponse } from "next/og";
import { BrandIcon } from "../../lib/brandIcon";

export function GET() {
  return new ImageResponse(<BrandIcon size={512} padded />, {
    width: 512,
    height: 512,
  });
}
