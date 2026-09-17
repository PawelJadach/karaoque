import type { Metadata } from "next";
import { CreateListPage } from "./CreateListPage";

export const metadata: Metadata = {
  title: "Stwórz listę",
};

export default function Page() {
  return <CreateListPage />;
}
