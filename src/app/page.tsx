"use client";
import { AppProvider } from "@contexts/AppContext";
import { FormProvider } from "@contexts/FormContext";
import { DialoguesCard } from "@/ui/Dialogues/Card";
import { SelectMenu } from "@/ui/Selection/Menu";

export default function App() {
  return (
    <AppProvider>
      <DialoguesCard />

      <FormProvider>
        <SelectMenu />
      </FormProvider>
    </AppProvider>
  );
}
