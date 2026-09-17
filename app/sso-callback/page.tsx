import type { Metadata } from "next";
import { ClerkSsoCallbackScreen } from "../../components/ClerkAuthScreen";

export const metadata: Metadata = {
  title: "Logowanie",
  robots: { index: false, follow: false },
};

export default function SsoCallbackPage() {
  return <ClerkSsoCallbackScreen />;
}
