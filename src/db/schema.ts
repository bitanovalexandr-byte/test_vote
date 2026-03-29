import { pgTable, serial, varchar, timestamp, integer, text, boolean, uniqueIndex } from 'drizzle-orm/pg-core';

// ===== ОСНОВНАЯ ТАБЛИЦА ГОЛОСОВ =====
export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  choice: varchar('choice', { length: 3 }).notNull(), // 'yes' или 'no'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===== ТАБЛИЦА ДЛЯ RATE LIMITING (вместо voters) =====
export const rateLimits = pgTable('rate_limits', {
  id: serial('id').primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(), // IP или fingerprint
  votedAt: timestamp('voted_at').defaultNow().notNull(),
}, (table) => ({
  identifierIdx: uniqueIndex('rate_limit_idx').on(table.identifier),
}));

// ===== ПОДГОТОВКА ДЛЯ БУДУЩИХ МНОЖЕСТВЕННЫХ ОПРОСОВ =====
export const polls = pgTable('polls', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  question: text('question').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endsAt: timestamp('ends_at'),
});