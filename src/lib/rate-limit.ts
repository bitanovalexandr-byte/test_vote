import { db } from '@/db';
import { rateLimits } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';

// Проверка, голосовал ли пользователь сегодня
export async function rateLimit(identifier: string, limit = 1) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Проверяем в базе данных
  const existingVote = await db
    .select()
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.identifier, identifier),
        gte(rateLimits.votedAt, today)
      )
    )
    .limit(1);
  
  if (existingVote.length > 0) {
    const nextMidnight = new Date(today);
    nextMidnight.setDate(today.getDate() + 1);
    
    return {
      success: false,
      limit,
      remaining: 0,
      reset: nextMidnight.getTime()
    };
  }
  
  return {
    success: true,
    limit,
    remaining: limit - 1,
    reset: new Date().setHours(24, 0, 0, 0)
  };
}