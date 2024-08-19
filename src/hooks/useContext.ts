import { useContext } from "react";
import { AppContext } from "@contexts/AppContext";
import { FormContext } from "@contexts/FormContext";

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useMapContext must be used within a MapContextProvider");
  }
  return context;
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === null) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
