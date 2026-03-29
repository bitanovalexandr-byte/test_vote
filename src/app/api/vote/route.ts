import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { polls, pollResults, rateLimits } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';

// Получить текущий активный опрос
async function getCurrentPoll() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const poll = await db
    .select()
    .from(polls)
    .where(
      and(
        eq(polls.isActive, true),
        gte(polls.scheduledFor, today)
      )
    )
    .limit(1);
  
  return poll[0];
}

export async function POST(req: NextRequest) {
  try {
    const { choice } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    if (choice !== 'yes' && choice !== 'no') {
      return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
    }
    
    // Получаем текущий опрос
    const currentPoll = await getCurrentPoll();
    if (!currentPoll) {
      return NextResponse.json({ error: 'No active poll today' }, { status: 404 });
    }
    
    // Проверяем rate limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingVote = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.identifier, ip),
          eq(rateLimits.pollId, currentPoll.id),
          gte(rateLimits.votedAt, today)
        )
      )
      .limit(1);
    
    if (existingVote.length > 0) {
      return NextResponse.json(
        { error: 'You have already voted today' },
        { status: 429 }
      );
    }
    
    // Обновляем результаты
    const result = await db
      .select()
      .from(pollResults)
      .where(eq(pollResults.pollId, currentPoll.id))
      .limit(1);
    
    if (result.length === 0) {
      // Создаём запись, если её нет
      await db.insert(pollResults).values({
        pollId: currentPoll.id,
        votesYes: choice === 'yes' ? 1 : 0,
        votesNo: choice === 'no' ? 1 : 0,
      });
    } else {
      // Обновляем существующую
      const currentResult = result[0];
      const updates = choice === 'yes' 
        ? { votesYes: (currentResult.votesYes || 0) + 1 }
        : { votesNo: (currentResult.votesNo || 0) + 1 };
      
      await db
        .update(pollResults)
        .set(updates)
        .where(eq(pollResults.pollId, currentPoll.id));
    }
    
    // Записываем rate limit
    await db.insert(rateLimits).values({
      identifier: ip,
      pollId: currentPoll.id,
    });
    
    // Возвращаем актуальные результаты
    const updatedResult = await db
      .select()
      .from(pollResults)
      .where(eq(pollResults.pollId, currentPoll.id))
      .limit(1);
    
    return NextResponse.json({
      question: currentPoll.question,
      yes: updatedResult[0]?.votesYes || 0,
      no: updatedResult[0]?.votesNo || 0,
      total: (updatedResult[0]?.votesYes || 0) + (updatedResult[0]?.votesNo || 0)
    });
    
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const currentPoll = await getCurrentPoll();
    if (!currentPoll) {
      return NextResponse.json({ error: 'No active poll today' }, { status: 404 });
    }
    
    const result = await db
      .select()
      .from(pollResults)
      .where(eq(pollResults.pollId, currentPoll.id))
      .limit(1);
    
    return NextResponse.json({
      question: currentPoll.question,
      yes: result[0]?.votesYes || 0,
      no: result[0]?.votesNo || 0,
      total: (result[0]?.votesYes || 0) + (result[0]?.votesNo || 0)
    });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}