import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prismaDB";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  const normalizedEmail = typeof email === "string" ? email.trim() : "";

  if (!normalizedEmail) {
    return NextResponse.json(
      { message: "Add meg az email címet." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Ezzel az email címmel nem létezik fiók." },
      { status: 404 },
    );
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  const passwordResetTokenExp = new Date();
  passwordResetTokenExp.setHours(passwordResetTokenExp.getHours() + 1);

  await prisma.user.update({
    where: {
      email: normalizedEmail,
    },
    data: {
      passwordResetToken: resetToken,
      passwordResetTokenExp,
    },
  });

  const resetURL = `${request.nextUrl.origin}/auth/reset-password/${resetToken}`;

  try {
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Jelszó visszaállítás - Szenzor24",
      text: `Jelszó visszaállítás: ${resetURL}`,
      html: `
        <div>
          <h1>Jelszó visszaállítás</h1>
          <p>A jelszó visszaállításához kattints az alábbi linkre:</p>
          <p><a href="${resetURL}" target="_blank">Jelszó visszaállítása</a></p>
          <p>Ha a gomb nem működik, másold be ezt a linket a böngészőbe:</p>
          <p>${resetURL}</p>
        </div>
      `,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[forget-password] SMTP reset email result", {
        accepted: emailResult.accepted,
        rejected: emailResult.rejected,
        pending: emailResult.pending,
        messageId: emailResult.messageId,
        response: emailResult.response,
      });
    }

    if (
      !emailResult.accepted?.includes(normalizedEmail) ||
      emailResult.rejected?.length
    ) {
      console.error("[forget-password] SMTP did not accept reset email", {
        accepted: emailResult.accepted,
        rejected: emailResult.rejected,
        response: emailResult.response,
      });

      return NextResponse.json(
        { message: "Az email küldése nem sikerült. Próbáld újra később." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: "A jelszó visszaállító emailt elküldtük.",
    });
  } catch (error) {
    console.error("[forget-password] Reset email send failed", error);

    return NextResponse.json(
      { message: "Az email küldése nem sikerült. Próbáld újra később." },
      { status: 500 },
    );
  }
}
