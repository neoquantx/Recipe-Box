import React, { createContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(authReducer, initialLoginState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          dispatch({
            type: "RESTORE_TOKEN",
            token: user.uid,
            user: snap.data() || null,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          dispatch({ type: "RESTORE_TOKEN", token: user.uid, user: null });
        }
      } else {
        dispatch({ type: "RESTORE_TOKEN", token: null });
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (email, password) => {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          dispatch({ type: "SIGN_IN", payload: { user: userCredential.user } });
        } catch (error) {
          throw new Error(error.message);
        }
      },

      signUp: async (fullName, email, password) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;
          await setDoc(doc(db, "users", user.uid), {
            fullName,
            email,
            createdAt: serverTimestamp(),
          });
          dispatch({ type: "SIGN_UP", payload: { user } });
        } catch (error) {
          throw new Error(error.message);
        }
      },

      signOut: async () => {
        try {
          await fbSignOut(auth);
          dispatch({ type: "SIGN_OUT" });
        } catch (error) {
          throw new Error(error.message);
        }
      },

      completeOnboarding: async () => {
        dispatch({ type: "COMPLETE_ONBOARDING" });
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={{ ...authContext, state, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const initialLoginState = {
  isSignout: false,
  userToken: null,
  user: null,
};

const authReducer = (prevState, action) => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...prevState,
        userToken: action.token,
        user: action.user || null,
        isSignout: false,
      };
    case "SIGN_IN":
      return {
        ...prevState,
        isSignout: false,
        userToken: action.payload.user.uid,
        user: action.payload.user,
      };
    case "SIGN_UP":
      return {
        ...prevState,
        isSignout: false,
        userToken: action.payload.user.uid,
        user: action.payload.user,
      };
    case "SIGN_OUT":
      return {
        ...prevState,
        isSignout: true,
        userToken: null,
        user: null,
      };
    default:
      return prevState;
  }
};
