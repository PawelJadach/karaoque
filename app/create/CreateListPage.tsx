"use client";

import { CreateListForm } from "../../components/CreateListForm";
import { HomeListSections } from "../../components/HomeListSections";
import { PageHeader } from "../../components/PageHeader";

export function CreateListPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-4 sm:pt-8">
      <PageHeader showHome />
      <CreateListForm />
      <div className="mt-8">
        <HomeListSections />
      </div>
    </main>
  );
}
