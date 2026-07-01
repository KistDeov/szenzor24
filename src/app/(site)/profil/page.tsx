import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileForm from "@/components/Profile/ProfileForm";
import { prisma } from "@/lib/prismaDB";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profil - Szenzor24",
};

const profileFields = [
  "name",
  "username",
  "email",
  "phone",
  "company_name",
  "postcode",
  "city",
  "street",
  "image",
  "created_at",
] as const;

type ProfileField = (typeof profileFields)[number];

async function getExistingProfileFields() {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users_new'
       AND COLUMN_NAME IN (${profileFields.map(() => "?").join(", ")})`,
    ...profileFields,
  )) as { COLUMN_NAME: string }[];

  return new Set(rows.map((row) => row.COLUMN_NAME as ProfileField));
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/profil");
  }

  const userId = Number(session.user.id);
  const existing = await getExistingProfileFields();
  const user: any = Number.isInteger(userId)
    ? (((await prisma.$queryRawUnsafe(
        `SELECT ${profileFields
          .map((field) => (existing.has(field) ? field : `NULL AS ${field}`))
          .join(", ")}
         FROM users_new
         WHERE id = ?
         LIMIT 1`,
        userId,
      )) as any[]) ?? [])[0] ?? null
    : null;

  if (!user) {
    redirect("/auth/signin?callbackUrl=/profil");
  }

  const displayName = user.name || user.username || "Felhasználó";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase();
  const registrationDate = new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(user.created_at);

  return (
    <main className="min-h-[70vh] pt-[170px] pb-24">
      <div className="container max-w-4xl">
        <div className="border-stroke dark:border-stroke-dark overflow-hidden rounded-2xl border bg-white shadow-lg dark:bg-[#15182A]">
          <div className="from-primary h-32 bg-gradient-to-r to-cyan-400" />
          <div className="px-6 pb-8 sm:px-10">
            <div className="-mt-16 mb-8 flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#15182A] text-3xl font-bold text-white shadow-md dark:border-[#15182A]">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={`${displayName} profilképe`}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  {displayName}
                </h1>
                {user.username && user.username !== displayName && (
                  <p className="text-body-color dark:text-body-color-dark mt-1">
                    @{user.username}
                  </p>
                )}
              </div>
            </div>

            <h2 className="mb-5 text-xl font-semibold text-black dark:text-white">
              Profiladatok
            </h2>
            <ProfileForm
              initialData={{
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                company_name: user.company_name || "",
                postcode: user.postcode ? String(user.postcode) : "",
                city: user.city || "",
                street: user.street || "",
              }}
            />
            <p className="text-body border-stroke dark:border-stroke-dark mt-8 border-t pt-5 text-sm">
              Regisztráció dátuma: {registrationDate}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
