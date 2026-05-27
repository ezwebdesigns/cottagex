import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const { name, email, text } = await request.json();
    if (!name || !email || !text) {
      return NextResponse.json({ error: 'Name, email, and message required' }, { status: 400 });
    }
    const [message] = await db.insert(messages).values({ name, email, text }).returning();
    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
