"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup } from "@/components/ui/input-group";
import { passwordValidation } from "@/utils/validations";
import { integrations, messages } from "@integrations-config";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  email: string;
  password: string;
  keepSignedIn: boolean;
};

function SignInFormInner({ callbackUrl }: { callbackUrl: string }) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm<Input>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: Input) {
    if (!integrations?.isAuthEnabled) {
      toast.error(messages?.auth);
      return;
    }

    const callback = await signIn("credentials", { ...data, redirect: false });

    if (callback?.error) {
      toast.error(callback.error);
      return;
    }

    let session = await getSession();

    for (let attempt = 0; !session?.user && attempt < 2; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      session = await getSession();
    }

    if (!session?.user) {
      toast.error("A bejelentkezés nem sikerült. Kérem próbálja újra.");
      return;
    }

    toast.success("Sikeres bejelentkezés!");
    reset();

    // Ensure cookies/session are applied before landing.
    // A full navigation is the most reliable way with App Router + next-auth/react.
    window.location.assign(callbackUrl);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <InputGroup
          type="email"
          label="Email cím"
          placeholder="Adja meg az email címét"
          errorMessages={errors?.email?.message}
          {...register("email", {
            required: true,
            validate: (value) => value.includes("@") || "Érvénytelen email cím",
          })}
        />
      </div>

      <div className="mb-6">
        <InputGroup
          type={showPassword ? "text" : "password"}
          label="Jelszó"
          placeholder="Adja meg a jelszavát"
          errorMessages={errors?.password?.message}
          rightElement={
            <button
              type="button"
              aria-label={
                showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"
              }
              title={showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
              className="text-body hover:text-primary dark:hover:text-primary dark:text-white/70"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58M9.88 4.24A10.4 10.4 0 0112 4c5.52 0 9 5.8 9 8a7.8 7.8 0 01-2.04 3.32M6.61 6.61C4.34 8.13 3 10.75 3 12c0 2.2 3.48 8 9 8 1.74 0 3.27-.58 4.52-1.43"
                  />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                  />
                </svg>
              )}
            </button>
          }
          {...register("password", {
            required: true,
            validate: (value) =>
              passwordValidation(value) ||
              "A jelszónak tartalmaznia kell legalább egy nagybetűt, egy kisbetűt, egy számot és egy speciális karaktert",
          })}
        />
      </div>

      <div className="mb-[30px] flex flex-wrap justify-between">
        <Controller
          control={control}
          name="keepSignedIn"
          render={({ field }) => (
            <Checkbox
              label="Maradjak bejelentkezve"
              name={field.name}
              onChange={(e) => field.onChange(e.target.checked)}
              defaultChecked={field.value}
            />
          )}
        />

        <Link
          href="/auth/forget-password"
          className="text-primary hover:underline sm:text-right"
        >
          Elfelejtette a jelszavát?
        </Link>
      </div>

      <button className="bg-primary hover:bg-primary/90 flex w-full justify-center rounded-md p-3 text-base font-medium text-white">
        Bejelentkezés
      </button>
    </form>
  );
}

function SignInFormWithParams() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  return <SignInFormInner callbackUrl={callbackUrl} />;
}

export function SignInForm() {
  return (
    <Suspense fallback={<div>Betöltés...</div>}>
      <SignInFormWithParams />
    </Suspense>
  );
}
