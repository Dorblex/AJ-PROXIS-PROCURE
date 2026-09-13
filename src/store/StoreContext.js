/* React context + convenience hooks for accessing the store from anywhere in the tree. */

import { createContext, useContext } from "react";

export const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);
export function useCustomer() {
  const { state } = useStore();
  return state.customers.find((c) => c.id === state.session.accountId) || state.customers[0];
}
export function useStaff() {
  const { state } = useStore();
  return state.staff.find((s) => s.id === state.session.accountId) || state.staff[0];
}
export function useSupplierAccount() {
  const { state } = useStore();
  return state.suppliers.find((s) => s.id === state.session.accountId) || state.suppliers[0];
}
export function useActingUser() {
  const { state } = useStore();
  return state.orgUsers.find((u) => u.id === state.session.actingUserId) || state.orgUsers[0];
}
