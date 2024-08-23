"use client";
import { AppProvider } from "@contexts/AppContext";
import { FormProvider } from "@contexts/FormContext";
import { DialoguesCard } from "@/ui/Dialogues/Card";
import { SelectMenu } from "@/ui/Selection/Menu";
import { Header } from "@/ui/Header/Card";
import {NotificationCard} from "@/ui/Notification/Notification";

export default function App() {
  return (
    <AppProvider>
      <Header />
      <section className="w-full h-full border-2 border-black rounded-md flex flex-col gap-4 p-6 justify-between font-jersey-25">
        <DialoguesCard />

        <FormProvider>
          <SelectMenu />
        </FormProvider>
      </section>
    </AppProvider>
  );
}
