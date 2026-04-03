"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signOut, getSession } from "next-auth/react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  tag: string;
  tagColor: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  isAuthInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authTab: "login" | "register";
  setAuthTab: (tab: "login" | "register") => void;
}

const DEFAULT_CTX: AuthContextType = {
  user: null,
  isLoggedIn: false,
  accessToken: null,
  isAuthInitialized: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  refreshUser: async () => {},
  showAuthModal: false,
  setShowAuthModal: () => {},
  authTab: "login",
  setAuthTab: () => {},
};

const AuthContext = createContext<AuthContextType>(DEFAULT_CTX);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status, update } = useSession();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // Keep the same shape of user
  let user: AuthUser | null = null;
  if (session?.user) {
    user = {
      id: session.user.id || "",
      name: session.user.name || "User",
      email: session.user.email || "",
      role: (session.user as any).role || "User",
      avatar: (session.user as any).avatar || "",
      tag: (session.user as any).tag || "Newbie",
      tagColor: (session.user as any).tagColor || "#6b7280",
    };
  }

  const isAuthInitialized = status !== "loading";

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res?.error) {
        console.error("Login failed:", res.error);
        return false;
      }
      setShowAuthModal(false);
      return true;
    } catch (err) {
      console.error("Login Error:", err);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (!res.ok) {
        console.error("Register failed:", await res.text());
        return false;
      }
      // After success, auto login
      return await login(email, password);
    } catch (err) {
      console.error("Register error:", err);
      return false;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  const refreshUser = async () => {
    await update(); // trigger next-auth session update
  };

  return (
    <AuthContext.Provider value={{
      user, 
      isLoggedIn: !!user, 
      accessToken: null, // JWT is handled globally by NextAuth in cookies
      isAuthInitialized,
      login, register, logout, refreshUser,
      showAuthModal, setShowAuthModal,
      authTab, setAuthTab,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);
