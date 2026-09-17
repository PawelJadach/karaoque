type BrandIconProps = {
  size: number;
  padded?: boolean;
  transparent?: boolean;
};

export function BrandIcon({
  size,
  padded = false,
  transparent = false,
}: BrandIconProps) {
  const canvas = padded ? Math.round(size * 0.72) : size;
  const radius = Math.round(canvas * 0.24);
  const border = Math.max(1, Math.round(canvas * 0.035));
  const capsuleW = Math.round(canvas * 0.26);
  const capsuleH = Math.round(canvas * 0.38);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: transparent ? "rgba(0,0,0,0)" : "#120814",
      }}
    >
      <div
        style={{
          width: canvas,
          height: canvas,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #2a1230 0%, #120814 100%)",
          borderRadius: radius,
          border: `${border}px solid rgba(255, 77, 141, 0.5)`,
        }}
      >
        <div
          style={{
            display: "flex",
            width: capsuleW,
            height: capsuleH,
            borderRadius: Math.round(capsuleW / 2),
            background: "#ff4d8d",
          }}
        />
      </div>
    </div>
  );
}
