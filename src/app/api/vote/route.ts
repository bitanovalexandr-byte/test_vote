import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { votes, rateLimits } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { choice } = await req.json();
    
    // Валидация
    if (choice !== 'yes' && choice !== 'no') {
      return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
    }

    // Получаем IP пользователя
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting — 1 голос в день по IP
    const { success, reset } = await rateLimit(ip);
    
    if (!success) {
      const resetDate = new Date(reset);
      const hoursLeft = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60));
      return NextResponse.json(
        { 
          error: `You can only vote once per day. Come back in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}` 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Reset': resetDate.toISOString(),
          }
        }
      );
    }

    // Сохраняем голос (анонимно!)
    await db.insert(votes).values({ choice });
    
    // Сохраняем запись о голосовании для rate limiting
    await db.insert(rateLimits).values({ identifier: ip });

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
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}