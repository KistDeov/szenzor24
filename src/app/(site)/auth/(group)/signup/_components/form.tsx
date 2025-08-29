import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup } from "@/components/ui/input-group";
import { passwordValidation } from "@/utils/validations";
import { integrations, messages } from "@integrations-config";
import axios from "axios";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  fullName: string;
  email: string;
  password: string;
  privacyPolicy: boolean;
};

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<Input>();

  async function onSubmit({ privacyPolicy, ...payload }: Input) {
    if (!integrations?.isAuthEnabled) {
      toast.error(messages?.auth);
      return;
    }

    try {
      await axios.post("/api/register", {
        ...payload,
        name: payload.fullName,
      });

      toast.success("User has been registered");
      reset();
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <InputGroup
          label="Full Name"
          placeholder="First and last name"
          required
          {...register("fullName", { required: "Full name is required" })}
          errorMessages={errors.fullName?.message}
        />
      </div>

      <div className="mb-5">
        <InputGroup
          type="email"
          label="Work Email"
          placeholder="Enter your email"
          required
          {...register("email", {
            required: "Email is required",
            validate: (value) => value.includes("@") || "Invalid email address",
          })}
          errorMessages={errors.email?.message}
        />
      </div>

      <div className="mb-6">
        <InputGroup
          type="password"
          label="Your password"
          placeholder="Enter your password"
          required
          {...register("password", {
            required: "Password is required",
            validate: (value) =>
              passwordValidation(value) ||
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          })}
          errorMessages={errors.password?.message}
        />
      </div>

      <div className="mb-[30px]">
        <Controller
          control={control}
          name="privacyPolicy"
          rules={{ required: "You must agree to the terms and conditions" }}
          render={({ field, fieldState }) => (
            <>
              <Checkbox
                name={field.name}
                onChange={(e) => field.onChange(e.target.checked)}
                defaultChecked={field.value}
                label={
                  <>
                    By creating account means you agree to the{" "}
                    <Link
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Terms and Conditions
                    </Link>
                    , and our{" "}
                    <Link
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </>
                }
              />
              {fieldState.error && (
                <p className="mt-2 text-sm text-red-500">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      <button className="bg-primary hover:bg-primary/90 flex w-full justify-center rounded-md p-3 text-base font-medium text-white">
        Sign Up
      </button>
    </form>
  );
}
