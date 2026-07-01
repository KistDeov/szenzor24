import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prismaDB";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const profileFields = [
  "name",
  "email",
  "phone",
  "company_name",
  "postcode",
  "city",
  "street",
] as const;

type ProfileField = (typeof profileFields)[number];

const cleanOptionalText = (value: unknown, maxLength = 255) => {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
};

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

function buildSelect(existing: Set<ProfileField>) {
  return profileFields
    .map((field) => (existing.has(field) ? field : `NULL AS ${field}`))
    .join(", ");
}

async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);
  return Number.isInteger(userId) ? userId : null;
}

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nincs bejelentkezve." }, { status: 401 });
  }

  const existing = await getExistingProfileFields();
  const user: any = (((await prisma.$queryRawUnsafe(
    `SELECT ${buildSelect(existing)}
     FROM users_new
     WHERE id = ?
     LIMIT 1`,
    userId,
  )) as any[]) ?? [])[0] ?? null;

  if (!user) {
    return NextResponse.json({ error: "A felhasználó nem található." }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nincs bejelentkezve." }, { status: 401 });
  }

  const body = await request.json();
  const name = cleanOptionalText(body.name);
  const email = cleanOptionalText(body.email)?.toLowerCase() ?? null;
  const postcodeText = cleanOptionalText(body.postcode, 4);

  if (!name || !email || !email.includes("@")) {
    return NextResponse.json(
      { error: "A név és egy érvényes e-mail-cím megadása kötelező." },
      { status: 400 },
    );
  }

  if (postcodeText && !/^\d{4}$/.test(postcodeText)) {
    return NextResponse.json(
      { error: "Az irányítószámnak 4 számjegyből kell állnia." },
      { status: 400 },
    );
  }

  const emailOwner = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  });

  if (emailOwner) {
    return NextResponse.json(
      { error: "Ez az e-mail-cím már használatban van." },
      { status: 409 },
    );
  }

  const existing = await getExistingProfileFields();
  const updatePairs = profileFields
    .filter((field) => existing.has(field))
    .map((field) => ({
      field,
      value:
        field === "name"
          ? name
          : field === "email"
            ? email
            : field === "phone"
              ? cleanOptionalText(body.phone)
              : field === "company_name"
                ? cleanOptionalText(body.company_name)
                : field === "postcode"
                  ? postcodeText
                    ? Number(postcodeText)
                    : null
                  : field === "city"
                    ? cleanOptionalText(body.city)
                    : field === "street"
                      ? cleanOptionalText(body.street)
                      : null,
    }));

  await prisma.$executeRawUnsafe(
    `UPDATE users_new
     SET ${updatePairs.map(({ field }) => `${field} = ?`).join(", ")}
     WHERE id = ?`,
    ...updatePairs.map(({ value }) => value),
    userId,
  );

  const updatedSelect = await getExistingProfileFields();
  const updatedUser: any = (((await prisma.$queryRawUnsafe(
    `SELECT ${buildSelect(updatedSelect)}
     FROM users_new
     WHERE id = ?
     LIMIT 1`,
    userId,
  )) as any[]) ?? [])[0] ?? null;

  return NextResponse.json(updatedUser);
}

export async function DELETE() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nincs bejelentkezve." }, { status: 401 });
  }

  const devices = await prisma.devices_new.findMany({
    where: { user_id: userId },
    select: { id: true, serial: true },
  });
  const deviceIds = devices.map((device) => device.id);
  const serials = devices
    .map((device) => device.serial)
    .filter((serial): serial is string => Boolean(serial));

  const sensors = deviceIds.length
    ? await prisma.sensors_new.findMany({
        where: { device_id: { in: deviceIds } },
        select: { id: true },
      })
    : [];
  const sensorIds = sensors.map((sensor) => sensor.id);

  await prisma.$transaction([
    prisma.account.deleteMany({ where: { userId } }),
    prisma.device_tokens.deleteMany({ where: { user_id: userId } }),
    prisma.email_alert_off.deleteMany({ where: { user_id: userId } }),
    ...(sensorIds.length
      ? [
          prisma.hourly_sensor_data_new.deleteMany({
            where: { sensor_id: { in: sensorIds } },
          }),
          prisma.sensor_data_new.deleteMany({
            where: { sensor_id: { in: sensorIds } },
          }),
          prisma.warnings_new.deleteMany({
            where: { sensor_id: { in: sensorIds } },
          }),
        ]
      : []),
    ...(deviceIds.length
      ? [
          prisma.paid_in_full_new.deleteMany({
            where: { device_id: { in: deviceIds } },
          }),
          prisma.device_battery_logs.deleteMany({
            where: { device_id: { in: deviceIds } },
          }),
          prisma.email_alert_off.deleteMany({
            where: { device_id: { in: deviceIds } },
          }),
        ]
      : []),
    ...(serials.length
      ? [
          prisma.config.deleteMany({
            where: { serial: { in: serials } },
          }),
        ]
      : []),
    prisma.sensors_new.deleteMany({ where: { device_id: { in: deviceIds } } }),
    prisma.devices_new.deleteMany({ where: { user_id: userId } }),
    prisma.notifications.deleteMany({ where: { user_id: userId } }),
    prisma.facilities_new.deleteMany({ where: { user_id: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
