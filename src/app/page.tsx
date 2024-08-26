"use client";
import { AppProvider } from "@contexts/AppContext";
import { FormProvider } from "@contexts/FormContext";
import { SelectMenu } from "@/ui/Selection/Menu";
import { Header } from "@/ui/Header/Card";
import { TextMenu } from "@/ui/Text/Menu";
import { NotificationCard } from "@/ui/Selection/components/Notification";

export default function App() {
  return (
    <AppProvider>
      <Header />

      <section className="w-full h-full border-2 border-black rounded-md flex flex-col gap-4 p-6 justify-between font-jersey-25 max-h-full overflow-hidden">
        <TextMenu />
        <FormProvider>
          <SelectMenu />
        </FormProvider>
      </section>
    </AppProvider>
  );
}
