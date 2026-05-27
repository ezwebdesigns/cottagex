import { NextResponse } from 'next/server';

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'chalet2024';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    return NextResponse.json({ success: true, token: 'admin-token' });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
