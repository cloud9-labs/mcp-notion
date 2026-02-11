import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NotionClient } from "./client.js";
import {
  SearchSchema,
  GetDatabaseSchema, QueryDatabaseSchema, CreateDatabaseSchema,
  CreatePageSchema, GetPageSchema, UpdatePageSchema,
  GetBlockSchema, GetBlockChildrenSchema, AppendBlockChildrenSchema, DeleteBlockSchema,
  ListUsersSchema, GetUserSchema,
} from "./schemas.js";

export function registerTools(server: McpServer): void {
  let _client: NotionClient | null = null;
  const getClient = () => {
    if (!_client) _client = new NotionClient();
    return _client;
  };

  // ============================================================
  // Search
  // ============================================================

  server.tool("notion_search", "Search across all pages and databases in the workspace.", SearchSchema.shape, async ({ query, filter, sort, startCursor, pageSize }) => {
    try {
      const result = await getClient().search(query, filter as Record<string, unknown>, sort as Record<string, unknown>, startCursor, pageSize);
      return { content: [{ type: "text" as const, text: JSON.stringify({ total: result.results.length, hasMore: result.has_more, nextCursor: result.next_cursor, results: result.results }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  // ============================================================
  // Database Tools
  // ============================================================

  server.tool("notion_get_database", "Get database schema and details.", GetDatabaseSchema.shape, async ({ databaseId }) => {
    try {
      const result = await getClient().getDatabase(databaseId);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("notion_query_database", "Query database entries with optional filters and sorting.", QueryDatabaseSchema.shape, async ({ databaseId, filter, sorts, startCursor, pageSize }) => {
    try {
      const result = await getClient().queryDatabase(databaseId, filter as Record<string, unknown>, sorts as Array<Record<string, unknown>>, startCursor, pageSize);
      return { content: [{ type: "text" as const, text: JSON.stringify({ total: result.results.length, hasMore: result.has_more, nextCursor: result.next_cursor, results: result.results }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("notion_create_database", "Create a new database inside a page.", CreateDatabaseSchema.shape, async ({ parentPageId, title, properties }) => {
    try {
      const result = await getClient().createDatabase(parentPageId, title, properties as Record<string, unknown>);
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, database: result }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  // ============================================================
  // Page Tools
  // ============================================================

  server.tool("notion_create_page", "Create a new page in a database or as a child of another page.", CreatePageSchema.shape, async ({ parentId, parentType, properties, children }) => {
    try {
      const result = await getClient().createPage(parentId, parentType, properties as Record<string, unknown>, children as Array<Record<string, unknown>>);
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, page: result }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("notion_get_page", "Get page properties and metadata.", GetPageSchema.shape, async ({ pageId }) => {
    try {
      const result = await getClient().getPage(pageId);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("notion_update_page", "Update page properties or archive a page.", UpdatePageSchema.shape, async ({ pageId, properties, archived }) => {
    try {
      const result = await getClient().updatePage(pageId, properties as Record<string, unknown>, archived);
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, page: result }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  // ============================================================
  // Block Tools
  // ============================================================

  server.tool("notion_get_block", "Get a block by ID.", GetBlockSchema.shape, async ({ blockId }) => {
    try {
      const result = await getClient().getBlock(blockId);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("notion_get_block_children", "Get child blocks of a block or page.", GetBlockChildrenSchema.shape, async ({ blockId, startCursor, pageSize }) => {
    try {
      const result = await getClient().getBlockChildren(blockId, startCursor, pageSize);
      return { content: [{ type: "text" as const, text: JSON.stringify({ total: result.results.length, hasMore: result.has_more, nextCursor: result.next_cursor, blocks: result.results }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("notion_append_block_children", "Append content blocks to a page or block.", AppendBlockChildrenSchema.shape, async ({ blockId, children }) => {
    try {
      const result = await getClient().appendBlockChildren(blockId, children as Array<Record<string, unknown>>);
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, blocks: result.results }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("notion_delete_block", "Delete (archive) a block.", DeleteBlockSchema.shape, async ({ blockId }) => {
    try {
      const result = await getClient().deleteBlock(blockId);
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, archived: result.archived, block: result }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  // ============================================================
  // User Tools
  // ============================================================

  server.tool("notion_list_users", "List all users in the workspace.", ListUsersSchema.shape, async ({ startCursor, pageSize }) => {
    try {
      const result = await getClient().listUsers(startCursor, pageSize);
      return { content: [{ type: "text" as const, text: JSON.stringify({ total: result.results.length, hasMore: result.has_more, users: result.results }, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("notion_get_user", "Get user details by ID.", GetUserSchema.shape, async ({ userId }) => {
    try {
      const result = await getClient().getUser(userId);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : "An unknown error occurred";
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
}
