"use client";
import { AppProvider } from "@contexts/AppContext";
import { FormProvider } from "@contexts/FormContext";
import { DialoguesCard } from "@/ui/Dialogues/Card";
import { SelectMenu } from "@/ui/Selection/Menu";
import { ClockCard } from "@/ui/Clock/Card";

export default function App() {
  return (
    <AppProvider>
      <ClockCard />
      <section className="w-full h-full border-2 border-black rounded-md flex flex-col gap-4 p-6 justify-between font-jersey-25">
        <DialoguesCard />

        <FormProvider>
          <SelectMenu />
        </FormProvider>
      </section>
    </AppProvider>
  );
}
