// Простая in-memory реализация rate limiting
// Работает и локально, и на Vercel (но сбрасывается при перезапуске)

const ipMap = new Map<string, number>();

export async function rateLimit(identifier: string, limit = 1, windowMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  const lastVote = ipMap.get(identifier);
  
  if (lastVote && now - lastVote < windowMs) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: lastVote + windowMs
    };
  }
  
  ipMap.set(identifier, now);
  
  // Очищаем старые записи (раз в час)
  if (Math.random() < 0.001) {
    for (const [key, time] of ipMap.entries()) {
      if (now - time > windowMs) {
        ipMap.delete(key);
      }
    }
  }
  
  return {
    success: true,
    limit,
    remaining: limit - 1,
    reset: now + windowMs
  };
}