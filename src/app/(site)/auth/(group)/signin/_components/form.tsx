"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup } from "@/components/ui/input-group";
import { passwordValidation } from "@/utils/validations";
import { integrations, messages } from "@integrations-config";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  email: string;
  password: string;
  keepSignedIn: boolean;
};

export function SignInForm() {
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

  function onSubmit(data: Input) {
    if (!integrations?.isAuthEnabled) {
      toast.error(messages?.auth);
      return;
    }

    signIn("credentials", { ...data, redirect: false }).then((callback) => {
      if (callback?.error) {
        toast.error(callback.error);
      }

      if (callback?.ok && !callback?.error) {
        toast.success("Logged in successfully");
        reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <InputGroup
          type="email"
          label="Your email"
          placeholder="Enter your email"
          errorMessages={errors?.email?.message}
          {...register("email", {
            required: true,
            validate: (value) => value.includes("@") || "Invalid email address",
          })}
        />
      </div>

      <div className="mb-6">
        <InputGroup
          type="password"
          label="Your password"
          placeholder="Enter your password"
          errorMessages={errors?.password?.message}
          {...register("password", {
            required: true,
            validate: (value) =>
              passwordValidation(value) ||
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          })}
        />
      </div>

      <div className="mb-[30px] flex flex-wrap justify-between">
        <Controller
          control={control}
          name="keepSignedIn"
          render={({ field }) => (
            <Checkbox
              label="Keep me signed in"
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
          Forgot Password?
        </Link>
      </div>

      <button className="bg-primary hover:bg-primary/90 flex w-full justify-center rounded-md p-3 text-base font-medium text-white">
        Sign In
      </button>
    </form>
  );
}
