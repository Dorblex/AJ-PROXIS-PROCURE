import { C } from "../shared/tokens.js";

/* Shared Tailwind classes + inline style for every text-style form control
   (TextInput, TextArea, Select), so they all look and behave identically. */
export const inputCls = "w-full rounded border px-2.5 py-1.5 text-sm outline-none focus:ring-1";
export const inputStyle = { borderColor: C.border };
