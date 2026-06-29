"use client";

import { InputHTMLAttributes, ReactNode, useId } from "react";

type PropsType = {
  label?: string;
  errorMessages?: string;
  rightElement?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id">;

export function InputGroup({
  label,
  errorMessages,
  rightElement,
  ...props
}: PropsType) {
  const inputId = useId();

  return (
    <fieldset>
      {label && (
        <label htmlFor={inputId} className="mb-2.5 inline-block text-sm">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          className={`border-stroke text-body focus:border-primary focus:shadow-input dark:border-stroke-dark dark:focus:border-primary w-full rounded-md border bg-white px-6 py-3 text-base font-medium outline-hidden dark:bg-black dark:text-white ${rightElement ? "pr-14" : ""}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {errorMessages && (
        <p className="mt-2 text-xs text-red-500">{errorMessages}</p>
      )}
    </fieldset>
  );
}
