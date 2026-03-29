import { pgTable, serial, varchar, text, timestamp, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';

// ===== ОПРОСЫ =====
export const polls = pgTable('polls', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(), // день, когда активен
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===== ГОЛОСА (только количество) =====
export const pollResults = pgTable('poll_results', {
  id: serial('id').primaryKey(),
  pollId: integer('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  votesYes: integer('votes_yes').default(0),
  votesNo: integer('votes_no').default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===== RATE LIMITING (1 голос в день по IP) =====
export const rateLimits = pgTable('rate_limits', {
  id: serial('id').primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  pollId: integer('poll_id').notNull(),
  votedAt: timestamp('voted_at').defaultNow().notNull(),
}, (table) => ({
  identifierIdx: uniqueIndex('rate_limit_idx').on(table.identifier, table.pollId),
}));