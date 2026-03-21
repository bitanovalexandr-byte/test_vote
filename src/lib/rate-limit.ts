// Получить следующий midnight
function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

// Проверить, голосовал ли пользователь сегодня
function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return date1.toDateString() === date2.toDateString();
}

// In-memory хранилище (на Vercel сбрасывается при перезапуске)
const votesMap = new Map<string, number>();

export async function rateLimit(identifier: string, limit = 1) {
  const now = Date.now();
  const lastVote = votesMap.get(identifier);
  
  // Если голосовал сегодня
  if (lastVote && isSameDay(lastVote, now)) {
    const nextMidnight = getNextMidnight();
    const hoursUntilReset = Math.ceil((nextMidnight - now) / (1000 * 60 * 60));
    
    return {
      success: false,
      limit,
      remaining: 0,
      reset: nextMidnight,
      message: `You can vote again in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''} (at midnight)`
    };
  }
  
  // Сохраняем голос
  votesMap.set(identifier, now);
  
  // Очищаем старые записи (раз в день)
  if (Math.random() < 0.01) {
    const today = new Date().toDateString();
    for (const [key, time] of votesMap.entries()) {
      if (new Date(time).toDateString() !== today) {
        votesMap.delete(key);
      }
    }
  }
  
  return {
    success: true,
    limit,
    remaining: limit - 1,
    reset: getNextMidnight()
  };
}