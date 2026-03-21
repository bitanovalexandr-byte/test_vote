import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

// Таблица голосов
export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  choice: varchar('choice', { length: 3 }).notNull(), // 'yes' или 'no'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица для отслеживания проголосовавших пользователей
export const voters = pgTable('voters', {
  id: serial('id').primaryKey(),
  fingerprint: varchar('fingerprint', { length: 255 }).notNull().unique(),
  choice: varchar('choice', { length: 3 }).notNull(),
  votedAt: timestamp('voted_at').defaultNow().notNull(),
});