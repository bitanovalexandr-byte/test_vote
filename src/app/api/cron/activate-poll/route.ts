import { NextResponse } from 'next/server';
import { db } from '@/db';
import { polls, pollResults } from '@/db/schema';
import { eq, and, lte, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  // Проверка секретного ключа (для безопасности)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Деактивируем старые опросы
    await db
      .update(polls)
      .set({ isActive: false })
      .where(lte(polls.scheduledFor, today));
    
    // Активируем сегодняшний опрос
    const todayPoll = await db
      .select()
      .from(polls)
      .where(
        and(
          eq(polls.scheduledFor, today),
          eq(polls.isActive, false)
        )
      )
      .limit(1);
    
    if (todayPoll.length > 0) {
      await db
        .update(polls)
        .set({ isActive: true })
        .where(eq(polls.id, todayPoll[0].id));
      
      // Создаём запись результатов для нового опроса
      await db.insert(pollResults).values({
        pollId: todayPoll[0].id,
        votesYes: 0,
        votesNo: 0,
      });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}