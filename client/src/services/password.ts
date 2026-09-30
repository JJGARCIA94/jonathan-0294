const ITERATIONS = 600_000
const SALT_BYTES = 16
const HASH_BITS = 256

export interface PasswordHash {
    hash: string
    salt: string
}

export async function hashPassword(password: string, salt: string = generateSalt()): Promise<PasswordHash> {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
    )

    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(salt), iterations: ITERATIONS },
        keyMaterial,
        HASH_BITS,
    )

    return { hash: bytesToHex(new Uint8Array(bits)), salt }
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
    const { hash } = await hashPassword(password, stored.salt)
    return hash === stored.hash
}

function generateSalt(): string {
    return bytesToHex(crypto.getRandomValues(new Uint8Array(SALT_BYTES)))
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
    const pairs = hex.match(/.{2}/g) ?? []
    return new Uint8Array(pairs.map((pair) => parseInt(pair, 16)))
}