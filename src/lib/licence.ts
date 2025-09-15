import { prisma } from './prismaDB';

// Generates a 16 char licence using unambiguous uppercase chars and digits
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateLicenceRaw(length = 16) {
  let out = '';
  const cryptoObj: Crypto | undefined = (globalThis as any).crypto;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint32Array(length);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      out += CHARSET[bytes[i] % CHARSET.length];
    }
    return out;
  }
  // Fallback (should rarely happen in Node 18+)
  for (let i = 0; i < length; i++) {
    out += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return out;
}

export async function generateUniqueLicence(retries = 5): Promise<string> {
  for (let i = 0; i < retries; i++) {
    const candidate = generateLicenceRaw();
    const existing = await prisma.user.findFirst({ where: { licence: candidate } });
    if (!existing) return candidate;
  }
  throw new Error('Failed to generate unique licence after retries');
}
