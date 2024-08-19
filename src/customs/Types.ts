import React from "react";

/* CONTEXT */
// FormContext
export type submitEvent =
  | React.FormEvent<HTMLFormElement>
  | React.MouseEvent<HTMLButtonElement>
  | React.MouseEvent<HTMLLIElement>
  | undefined;
