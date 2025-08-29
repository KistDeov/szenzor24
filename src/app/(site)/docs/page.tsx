import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs Page - Solid SaaS Boilerplate",
  description: "This is Docs page for Solid Pro",
  // other metadata
};

export default function DocsPage() {
  return (
    <article>
      <h1>Welcome to Startup Documentation</h1>

      <p className="text-body-color dark:text-body-color-dark text-base">
        This document serves as a simple template to showcase a sample layout
        and format. It is solely created for demonstration purposes and is not
        intended for any official use.
      </p>
      <p className="text-body-color dark:text-body-color-dark text-base">
        Please visit:{" "}
        <a href="https://nextjstemplates.com/docs">nextjstemplates.com/docs</a>{" "}
        to check out the real docs, setup guide and even video instructions
      </p>
    </article>
  );
}
