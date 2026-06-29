import crypto from "crypto";

type SsoPayload = {
  email: string;
  userId: string;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSsoSecret() {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("Missing NEXTAUTH_SECRET for SSO token signing.");
  }

  return secret;
}

function sign(data: string) {
  return crypto
    .createHmac("sha256", getSsoSecret())
    .update(data)
    .digest("base64url");
}

export function createSsoToken(payload: Omit<SsoPayload, "exp">) {
  const tokenPayload: SsoPayload = {
    ...payload,
    exp: Date.now() + 60 * 1000,
  };
  const body = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = sign(body);

  return `${body}.${signature}`;
}

export function verifySsoToken(token: string) {
  try {
    const [body, signature] = token.split(".");

    if (!body || !signature) {
      return null;
    }

    const expectedSignature = sign(body);
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(body)) as SsoPayload;

    if (!payload.email || !payload.userId || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
