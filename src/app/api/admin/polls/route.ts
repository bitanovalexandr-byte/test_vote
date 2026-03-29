import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { polls, pollResults } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// Простая аутентификация для API
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  // В реальном проекте используйте JWT или session
  return authHeader === 'Bearer admin123';
}

// GET: получить все опросы с результатами
export async function GET(request: NextRequest) {
  const allPolls = await db
    .select()
    .from(polls)
    .orderBy(desc(polls.scheduledFor));
  
  const pollsWithResults = await Promise.all(
    allPolls.map(async (poll) => {
      const result = await db
        .select()
        .from(pollResults)
        .where(eq(pollResults.pollId, poll.id))
        .limit(1);
      
      return {
        ...poll,
        votesYes: result[0]?.votesYes || 0,
        votesNo: result[0]?.votesNo || 0,
      };
    })
  );
  
  return NextResponse.json(pollsWithResults);
}

// POST: создать новый опрос
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer admin123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { question, scheduledFor } = await request.json();
  
  if (!question || !scheduledFor) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  const scheduledDate = new Date(scheduledFor);
  scheduledDate.setHours(0, 0, 0, 0);
  
  const [newPoll] = await db.insert(polls).values({
    question,
    scheduledFor: scheduledDate,
    isActive: false,
  }).returning();
  
  await db.insert(pollResults).values({
    pollId: newPoll.id,
    votesYes: 0,
    votesNo: 0,
  });
  
  return NextResponse.json({ success: true, poll: newPoll });
}