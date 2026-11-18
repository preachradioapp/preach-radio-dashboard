/** The reset email survives a page refresh within the tab, but not beyond it. */
const KEY = "preach-admin:reset-email";

export const resetFlow = {
  setEmail: (email) => sessionStorage.setItem(KEY, email),
  getEmail: () => sessionStorage.getItem(KEY) || "",
  clear: () => sessionStorage.removeItem(KEY),
};
