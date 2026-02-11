import { z } from "zod";

// ============================================================
// Search Schema
// ============================================================

export const SearchSchema = z.object({
  query: z.string().optional().describe("Search query text"),
  filter: z.record(z.unknown()).optional().describe("Filter object, e.g. { property: 'object', value: 'page' }"),
  sort: z.record(z.unknown()).optional().describe("Sort object, e.g. { direction: 'descending', timestamp: 'last_edited_time' }"),
  startCursor: z.string().optional().describe("Pagination cursor from previous response"),
  pageSize: z.number().optional().describe("Number of results per page (max 100)"),
});

// ============================================================
// Database Schemas
// ============================================================

export const GetDatabaseSchema = z.object({
  databaseId: z.string().describe("Notion database ID"),
});

export const QueryDatabaseSchema = z.object({
  databaseId: z.string().describe("Notion database ID to query"),
  filter: z.record(z.unknown()).optional().describe("Notion filter object for querying database entries"),
  sorts: z.array(z.record(z.unknown())).optional().describe("Array of sort objects, e.g. [{ property: 'Name', direction: 'ascending' }]"),
  startCursor: z.string().optional().describe("Pagination cursor from previous response"),
  pageSize: z.number().optional().describe("Number of results per page (max 100)"),
});

export const CreateDatabaseSchema = z.object({
  parentPageId: z.string().describe("Parent page ID where the database will be created"),
  title: z.string().describe("Database title"),
  properties: z.record(z.unknown()).describe("Database property schema, e.g. { 'Name': { title: {} }, 'Tags': { multi_select: { options: [] } } }"),
});

// ============================================================
// Page Schemas
// ============================================================

export const CreatePageSchema = z.object({
  parentId: z.string().describe("Parent ID (database ID or page ID)"),
  parentType: z.string().describe("Parent type: 'database_id' or 'page_id'"),
  properties: z.record(z.unknown()).describe("Page properties matching the parent database schema"),
  children: z.array(z.record(z.unknown())).optional().describe("Array of block objects for page content"),
});

export const GetPageSchema = z.object({
  pageId: z.string().describe("Notion page ID"),
});

export const UpdatePageSchema = z.object({
  pageId: z.string().describe("Page ID to update"),
  properties: z.record(z.unknown()).optional().describe("Updated page properties"),
  archived: z.boolean().optional().describe("Set to true to archive (delete) the page"),
});

// ============================================================
// Block Schemas
// ============================================================

export const GetBlockSchema = z.object({
  blockId: z.string().describe("Notion block ID"),
});

export const GetBlockChildrenSchema = z.object({
  blockId: z.string().describe("Parent block ID to get children from"),
  startCursor: z.string().optional().describe("Pagination cursor"),
  pageSize: z.number().optional().describe("Number of results per page (max 100)"),
});

export const AppendBlockChildrenSchema = z.object({
  blockId: z.string().describe("Parent block ID to append children to"),
  children: z.array(z.record(z.unknown())).describe("Array of block objects to append"),
});

export const DeleteBlockSchema = z.object({
  blockId: z.string().describe("Block ID to delete (archive)"),
});

// ============================================================
// User Schemas
// ============================================================

export const ListUsersSchema = z.object({
  startCursor: z.string().optional().describe("Pagination cursor"),
  pageSize: z.number().optional().describe("Number of results per page (max 100)"),
});

export const GetUserSchema = z.object({
  userId: z.string().describe("Notion user ID"),
});
