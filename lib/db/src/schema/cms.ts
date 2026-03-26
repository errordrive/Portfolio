import {
  pgTable,
  text,
  boolean,
  timestamp,
  jsonb,
  serial,
  integer,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contentSections = pgTable("content_sections", {
  section: text("section").primaryKey(),
  data: jsonb("data").notNull().default({}),
  visible: boolean("visible").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  featuredImage: text("featured_image").notNull().default(""),
  tags: text("tags").array().notNull().default([]),
  metaTitle: text("meta_title").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  published: boolean("published").notNull().default(false),
  adsEnabled: boolean("ads_enabled").notNull().default(false),
  adTop: boolean("ad_top").notNull().default(false),
  adMiddle: boolean("ad_middle").notNull().default(false),
  adBottom: boolean("ad_bottom").notNull().default(false),
  adScript: text("ad_script").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cvFile = pgTable("cv_file", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogComments = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  parentId: integer("parent_id").references((): AnyPgColumn => blogComments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  content: text("content").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentReactions = pgTable("comment_reactions", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull().references(() => blogComments.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  count: integer("count").notNull().default(0),
}, (t) => ({
  uniqueCommentType: unique().on(t.commentId, t.type),
}));

export type AdminUser = typeof adminUsers.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type ContentSection = typeof contentSections.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type BlogComment = typeof blogComments.$inferSelect;
export type CommentReaction = typeof commentReactions.$inferSelect;
