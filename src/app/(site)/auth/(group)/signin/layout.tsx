import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Login Page - Appline SaaS Boilerplate",
  description: "This is Login page for Startup Pro",
  // other metadata
};

export default function Layout({ children }: PropsWithChildren) {
  return children;
}
