import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const books = sqliteTable('books', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull().default('Unknown'),
  uploadDate: integer('upload_date', { mode: 'timestamp' }).notNull(),
});

export const chapters = sqliteTable('chapters', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  order: integer('order').notNull(),
});

export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  chapterId: text('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull(),
  
  // AI Insight Fields (Phase 3)
  isAnalyzed: integer('is_analyzed', { mode: 'boolean' }).notNull().default(false),
  keyIdea: text('key_idea'),
  whyItMatters: text('why_it_matters'),
  authorMeaning: text('author_meaning'),
  deepAnalysis: text('deep_analysis'),
  argumentMap: text('argument_map', { mode: 'json' }), // JSON array of strings
  assumptions: text('assumptions', { mode: 'json' }), // JSON array of strings
});
