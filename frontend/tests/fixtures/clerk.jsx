/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
const Identity = createContext(null);
const getToken = async () => "fixture-session-token";
export function ClerkProvider({ children }) {
  const [signedIn, setSignedIn] = useState(
    !sessionStorage.getItem("fixture-signed-out"),
  );
  return (
    <Identity.Provider value={{ signedIn, setSignedIn }}>
      {children}
    </Identity.Provider>
  );
}
export function useAuth() {
  const { signedIn } = useContext(Identity);
  return {
    isLoaded: true,
    isSignedIn: signedIn,
    userId: signedIn ? "fixture-user" : null,
    getToken,
  };
}
export function useClerk() {
  const { setSignedIn } = useContext(Identity);
  return { openUserProfile: () => {}, signOut: async () => setSignedIn(false) };
}
export const SignIn = () => <div>Sign in fixture</div>;
export const SignUp = () => <div>Sign up fixture</div>;
