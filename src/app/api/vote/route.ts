import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { votes, voters } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

function generateFingerprint(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const ua = req.headers.get('user-agent') || 'unknown';
  return crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { choice } = await req.json();
    const fingerprint = generateFingerprint(req);
    
    // Rate limiting — 1 голос в 24 часа
    const { success } = await rateLimit(fingerprint);
    
    if (!success) {
      return NextResponse.json(
        { error: 'You can only vote once per 24 hours' },
        { status: 429 }
      );
    }
    
    if (choice !== 'yes' && choice !== 'no') {
      return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
    }

    // Проверяем, голосовал ли уже этот пользователь (старая логика)
    const existingVoter = await db
      .select()
      .from(voters)
      .where(eq(voters.fingerprint, fingerprint))
      .limit(1);

    if (existingVoter.length > 0) {
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 409 }
      );
    }

    // Сохраняем голос
    await db.insert(votes).values({ choice });
    await db.insert(voters).values({ fingerprint, choice });

    // Получаем актуальную статистику
    const stats = await db
      .select({
        yes: sql<number>`count(case when choice = 'yes' then 1 end)`,
        no: sql<number>`count(case when choice = 'no' then 1 end)`,
        total: sql<number>`count(*)`,
      })
      .from(votes);

    return NextResponse.json(stats[0]);
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = await db
      .select({
        yes: sql<number>`count(case when choice = 'yes' then 1 end)`,
        no: sql<number>`count(case when choice = 'no' then 1 end)`,
        total: sql<number>`count(*)`,
      })
      .from(votes);

    return NextResponse.json(stats[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}