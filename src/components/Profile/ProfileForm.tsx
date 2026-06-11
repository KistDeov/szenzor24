"use client";

import { signOut, useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  postcode: string;
  city: string;
  street: string;
};

const fields: Array<{
  name: keyof ProfileFormData;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "numeric" | "tel";
  maxLength?: number;
}> = [
  { name: "name", label: "Teljes név", required: true, autoComplete: "name", maxLength: 255 },
  { name: "email", label: "E-mail-cím", type: "email", required: true, autoComplete: "email", maxLength: 255 },
  { name: "phone", label: "Telefonszám", type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: 255 },
  { name: "company_name", label: "Cégnév", autoComplete: "organization", maxLength: 255 },
  { name: "postcode", label: "Irányítószám", autoComplete: "postal-code", inputMode: "numeric", maxLength: 4 },
  { name: "city", label: "Város", autoComplete: "address-level2", maxLength: 255 },
  { name: "street", label: "Közterület neve", autoComplete: "address-line1", maxLength: 255 },
];

export default function ProfileForm({
  initialData,
}: {
  initialData: ProfileFormData;
}) {
  const { update } = useSession();
  const [form, setForm] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizeProfileData = (data: Partial<ProfileFormData>) => ({
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    company_name: data.company_name ?? "",
    postcode: data.postcode ?? "",
    city: data.city ?? "",
    street: data.street ?? "",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "A profil mentése sikertelen.");
      }

      setForm((current) =>
        normalizeProfileData({
          ...current,
          ...data,
          postcode: data.postcode != null ? String(data.postcode) : "",
        }),
      );
      await update();
      toast.success("A profiladatok mentve.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "A profil mentése sikertelen.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd a profilodat? Ez véglegesen eltávolítja a fiókot és a kapcsolódó adatokat.",
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/profile", { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "A profil törlése sikertelen.");
      }

      toast.success("A profil törölve lett.");
      await signOut({ callbackUrl: "/auth/signin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "A profil törlése sikertelen.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="space-y-2">
            <span className="block text-sm font-medium text-black dark:text-white">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </span>
            <input
              type={field.type || "text"}
              required={field.required}
              autoComplete={field.autoComplete}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              value={form[field.name]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [field.name]: event.target.value,
                }))
              }
              className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-black outline-none dark:text-white"
            />
          </label>
        ))}
      </div>

      <p className="text-body mt-5 text-sm">
        A megadott cím automatikusan megjelenik a rendelésnél, de a felhasználó
        bármikor módosíthatja.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSaving || isDeleting}
          className="bg-primary hover:bg-primary/90 rounded-lg px-7 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? "Mentés..." : "Profil mentése"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving || isDeleting}
          className="rounded-lg border border-red-500 px-7 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          {isDeleting ? "Törlés..." : "Profil törlése"}
        </button>
      </div>
    </form>
  );
}
