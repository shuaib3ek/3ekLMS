import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key_change_me_in_prod');

export type SessionPayload = {
    userId: string;
    email: string;
    role: string;
    orgId: string;
    expiresAt: Date;
};

export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // 1 day session
        .sign(key);
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(userId: string, email: string, role: string, orgId: string) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 Day
    const session = await encrypt({ userId, email, role, orgId, expiresAt });

    (await cookies()).set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function verifySession() {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
        return null;
    }

    return { userId: session.userId as string, role: session.role as string, orgId: session.orgId as string };
}

export async function deleteSession() {
    (await cookies()).delete('session');
}
