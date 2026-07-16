import { pgTable, serial, text, integer, decimal, boolean, json, timestamp, varchar, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  role: varchar('role', { length: 50 }).default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }),
  location: varchar('location', { length: 255 }).notNull(),
  province: varchar('province', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  rating: varchar('rating', { length: 10 }),
  reviews: integer('reviews').default(0),
  image: text('image'),
  tag: varchar('tag', { length: 100 }),
  description: text('description'),
  vrboLink: text('vrbo_link'),
  isLiked: boolean('is_liked').default(false),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  template: varchar('template', { length: 50 }).default('standard').notNull(),
  content: text('content').default(''),
  seoTitle: varchar('seo_title', { length: 255 }),
  metaDescription: text('meta_description'),
  featuredImage: text('featured_image'),
  faq: json('faq').default([]),
  ctaTitle: varchar('cta_title', { length: 255 }),
  ctaButton: varchar('cta_button', { length: 255 }),
  ctaLink: text('cta_link'),
  ctaDescription: text('cta_description'),
  exploreTitle: varchar('explore_title', { length: 255 }),
  exploreSubtitle: varchar('explore_subtitle', { length: 255 }),
  exploreDescription: text('explore_description'),
  exploreItems: json('explore_items').default([]),
  locationData: json('location_data').default({}),
  isPublished: boolean('is_published').default(true),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 50 }).default('standard').notNull(),
  content: text('content').default(''),
  excerpt: text('excerpt'),
  category: varchar('category', { length: 100 }),
  author: varchar('author', { length: 255 }).default('Editorial Team'),
  featuredImage: text('featured_image'),
  imageAlt: varchar('image_alt', { length: 255 }),
  seoTitle: varchar('seo_title', { length: 255 }),
  seoKeywords: text('seo_keywords'),
  faq: json('faq').default([]),
  ctaTitle: varchar('cta_title', { length: 255 }),
  ctaButton: varchar('cta_button', { length: 255 }),
  ctaLink: text('cta_link'),
  isPublished: boolean('is_published').default(true),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const listicleItems = pgTable('listicle_items', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id).notNull(),
  rank: integer('rank').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  rating: varchar('rating', { length: 10 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  image: text('image'),
  vibe: varchar('vibe', { length: 100 }),
  vrboLink: text('vrbo_link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  text: text('text').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  subscribed: boolean('subscribed').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const libraryImages = pgTable('library_images', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  url: text('url').notNull(),
  mimetype: varchar('mimetype', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  section: varchar('section', { length: 100 }).notNull().unique(),
  data: json('data').notNull().default({}),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const searchLinks = pgTable('search_links', {
  id: serial('id').primaryKey(),
  city: text('city').notNull(),
  category: text('category').notNull(),
  categoryFr: text('category_fr'),
  affiliateUrl: text('affiliate_url').notNull(),
  platform: varchar('platform', { length: 50 }).default('vrbo'),
  type: varchar('type', { length: 20 }).default('city').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
