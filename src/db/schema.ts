import { pgTable, serial, varchar, text, timestamp, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';

// ===== НОВЫЕ ТАБЛИЦЫ =====

// Таблица опросов
export const polls = pgTable('polls', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  question: text('question').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endsAt: timestamp('ends_at'),
});

// Таблица для rate limiting (временная)
export const rateLimits = pgTable('rate_limits', {
  id: serial('id').primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  pollId: integer('poll_id').notNull(),
  votedAt: timestamp('voted_at').defaultNow().notNull(),
}, (table) => ({
  identifierIdx: uniqueIndex('rate_limit_idx').on(table.identifier, table.pollId),
}));

// ===== СТАРЫЕ ТАБЛИЦЫ (пока оставляем для совместимости) =====

// Таблица голосов (старая, будет заменена)
export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  choice: varchar('choice', { length: 3 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица для отслеживания проголосовавших (старая, будет удалена)
export const voters = pgTable('voters', {
  id: serial('id').primaryKey(),
  fingerprint: varchar('fingerprint', { length: 255 }).notNull().unique(),
  choice: varchar('choice', { length: 3 }).notNull(),
  votedAt: timestamp('voted_at').defaultNow().notNull(),
});