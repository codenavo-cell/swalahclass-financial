// Cryptographic authentication security
// Passwords are NEVER hardcoded in plain-text in frontend source code.
// Verification uses SHA-256 one-way hashing with Web Crypto API.

export async function hashPassword(password: string): Promise<string> {
  const clean = password.trim();
  const msgUint8 = new TextEncoder().encode(clean);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Pre-computed SHA-256 hashes of authorized default credentials
export const DEFAULT_ADMIN_PASSWORD_HASH =
  '944d0c05f38e4fd10ccdd724b5f3af01a4474a8df470a06d15b49b1549ac3ea8';

export const DEFAULT_TEACHER_PASSWORD_HASH =
  '158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab';

// Authorized emails / usernames
export const AUTHORIZED_ADMIN_EMAILS = [
  'admin@example.com',
  'codenavo@gmail.com',
  'admin',
];

export const AUTHORIZED_TEACHER_IDENTIFIERS = [
  'nirs',
  'teacher',
  'classteacher',
  'teacher@noorulhuda.edu',
];
