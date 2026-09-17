import { dark } from "@clerk/themes";

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "#ff4d8d",
    colorForeground: "#fdf7ff",
    colorBackground: "#241030",
    colorMutedForeground: "#c4b0cf",
    colorInput: "rgba(0, 0, 0, 0.35)",
    colorInputForeground: "#fdf7ff",
    colorDanger: "#ff4d8d",
    colorRing: "#ff4d8d",
    colorBorder: "rgba(255, 255, 255, 0.1)",
    colorShadow: "rgba(0, 0, 0, 0.45)",
    fontFamily: "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
    borderRadius: "1.25rem",
    spacing: "1rem",
  },
  elements: {
    modalBackdrop: "bg-black/70 backdrop-blur-sm",
    modalContent: "border border-white/10 bg-[#241030] shadow-2xl",
    card: "border border-white/10 bg-[#241030] shadow-none",
    headerTitle: "text-[#fdf7ff] font-semibold",
    headerSubtitle: "text-[#c4b0cf]",
    socialButtonsBlockButton:
      "!h-12 !rounded-2xl !border !border-white/10 !bg-white !text-zinc-900 hover:!bg-white",
    socialButtonsBlockButtonText: "!text-zinc-900 !font-semibold",
    footer: "bg-transparent text-[#c4b0cf]",
    footerActionText: "text-[#c4b0cf]",
    footerActionLink: "text-[#ff4d8d] hover:text-[#ff4d8d]",
    identityPreview: "border border-white/10 bg-black/25",
    userButtonBox: "flex items-center",
    userButtonAvatarBox: "h-11 w-11",
    userButtonPopoverCard:
      "border border-white/10 bg-[#241030] text-[#fdf7ff]",
    userButtonPopoverActionButton: "text-[#fdf7ff] hover:bg-white/5",
    userButtonPopoverActionButtonText: "text-[#fdf7ff]",
    userButtonPopoverFooter: "hidden",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
};
