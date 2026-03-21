import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Таблица голосов
export const votes = sqliteTable('votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  choice: text('choice').notNull(), // 'yes' или 'no'
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Таблица для отслеживания проголосовавших пользователей
export const voters = sqliteTable('voters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fingerprint: text('fingerprint').notNull().unique(),
  choice: text('choice').notNull(),
  votedAt: integer('voted_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});