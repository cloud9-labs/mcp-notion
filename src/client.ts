const BASE_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

/**
 * Notion API Client
 *
 * Reads integration token from the NOTION_API_KEY environment variable.
 * Rate limiting: 3 req/sec with sliding window and 429 retry.
 */
export class NotionClient {
  private readonly apiKey: string;
  private requestTimestamps: number[] = [];

  constructor() {
    const key = process.env.NOTION_API_KEY;
    if (!key) {
      throw new Error(
        "NOTION_API_KEY environment variable is not set. " +
          "Create an integration at https://www.notion.so/my-integrations"
      );
    }
    this.apiKey = key;
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const windowMs = 1_000;
    const maxRequests = 3;

    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < windowMs
    );

    if (this.requestTimestamps.length >= maxRequests) {
      const oldest = this.requestTimestamps[0];
      const waitMs = windowMs - (now - oldest) + 50;
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }

    this.requestTimestamps.push(Date.now());
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    await this.throttle();

    const url = `${BASE_URL}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    };

    const options: RequestInit = { method, headers };

    if (body !== undefined && (method === "POST" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const waitSec = retryAfter ? Number(retryAfter) : 1;
      await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
      return this.request<T>(method, path, body);
    }

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      throw new Error(
        `Notion API error (${res.status} ${res.statusText}): ${errorBody}`
      );
    }

    return (await res.json()) as T;
  }

  // ----------------------------------------------------------
  // Search
  // ----------------------------------------------------------

  async search(
    query?: string,
    filter?: Record<string, unknown>,
    sort?: Record<string, unknown>,
    startCursor?: string,
    pageSize?: number
  ): Promise<NotionSearchResult> {
    const body: Record<string, unknown> = {};
    if (query) body.query = query;
    if (filter) body.filter = filter;
    if (sort) body.sort = sort;
    if (startCursor) body.start_cursor = startCursor;
    if (pageSize) body.page_size = pageSize;
    return this.request<NotionSearchResult>("POST", "/search", body);
  }

  // ----------------------------------------------------------
  // Database Operations
  // ----------------------------------------------------------

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    return this.request<NotionDatabase>("GET", `/databases/${databaseId}`);
  }

  async queryDatabase(
    databaseId: string,
    filter?: Record<string, unknown>,
    sorts?: Array<Record<string, unknown>>,
    startCursor?: string,
    pageSize?: number
  ): Promise<NotionQueryResult> {
    const body: Record<string, unknown> = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (startCursor) body.start_cursor = startCursor;
    if (pageSize) body.page_size = pageSize;
    return this.request<NotionQueryResult>(
      "POST",
      `/databases/${databaseId}/query`,
      body
    );
  }

  async createDatabase(
    parentPageId: string,
    title: string,
    properties: Record<string, unknown>
  ): Promise<NotionDatabase> {
    return this.request<NotionDatabase>("POST", "/databases", {
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: title } }],
      properties,
    });
  }

  // ----------------------------------------------------------
  // Page Operations
  // ----------------------------------------------------------

  async createPage(
    parentId: string,
    parentType: string,
    properties: Record<string, unknown>,
    children?: Array<Record<string, unknown>>
  ): Promise<NotionPage> {
    const body: Record<string, unknown> = {
      parent: { type: parentType, [parentType]: parentId },
      properties,
    };
    if (children) body.children = children;
    return this.request<NotionPage>("POST", "/pages", body);
  }

  async getPage(pageId: string): Promise<NotionPage> {
    return this.request<NotionPage>("GET", `/pages/${pageId}`);
  }

  async updatePage(
    pageId: string,
    properties?: Record<string, unknown>,
    archived?: boolean
  ): Promise<NotionPage> {
    const body: Record<string, unknown> = {};
    if (properties) body.properties = properties;
    if (archived !== undefined) body.archived = archived;
    return this.request<NotionPage>("PATCH", `/pages/${pageId}`, body);
  }

  // ----------------------------------------------------------
  // Block Operations
  // ----------------------------------------------------------

  async getBlock(blockId: string): Promise<NotionBlock> {
    return this.request<NotionBlock>("GET", `/blocks/${blockId}`);
  }

  async getBlockChildren(
    blockId: string,
    startCursor?: string,
    pageSize?: number
  ): Promise<NotionBlockChildren> {
    let path = `/blocks/${blockId}/children`;
    const params: string[] = [];
    if (startCursor) params.push(`start_cursor=${startCursor}`);
    if (pageSize) params.push(`page_size=${pageSize}`);
    if (params.length > 0) path += `?${params.join("&")}`;
    return this.request<NotionBlockChildren>("GET", path);
  }

  async appendBlockChildren(
    blockId: string,
    children: Array<Record<string, unknown>>
  ): Promise<NotionBlockChildren> {
    return this.request<NotionBlockChildren>(
      "PATCH",
      `/blocks/${blockId}/children`,
      { children }
    );
  }

  async deleteBlock(blockId: string): Promise<NotionBlock> {
    return this.request<NotionBlock>("DELETE", `/blocks/${blockId}`);
  }

  // ----------------------------------------------------------
  // User Operations
  // ----------------------------------------------------------

  async listUsers(
    startCursor?: string,
    pageSize?: number
  ): Promise<NotionUserList> {
    let path = "/users";
    const params: string[] = [];
    if (startCursor) params.push(`start_cursor=${startCursor}`);
    if (pageSize) params.push(`page_size=${pageSize}`);
    if (params.length > 0) path += `?${params.join("&")}`;
    return this.request<NotionUserList>("GET", path);
  }

  async getUser(userId: string): Promise<NotionUser> {
    return this.request<NotionUser>("GET", `/users/${userId}`);
  }
}

// ============================================================
// Response Types
// ============================================================

export interface NotionSearchResult {
  object: string;
  results: Array<Record<string, unknown>>;
  has_more: boolean;
  next_cursor: string | null;
}

export interface NotionDatabase {
  object: string;
  id: string;
  title: Array<{ plain_text: string }>;
  properties: Record<string, unknown>;
  created_time: string;
  last_edited_time: string;
}

export interface NotionQueryResult {
  object: string;
  results: Array<Record<string, unknown>>;
  has_more: boolean;
  next_cursor: string | null;
}

export interface NotionPage {
  object: string;
  id: string;
  properties: Record<string, unknown>;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
}

export interface NotionBlock {
  object: string;
  id: string;
  type: string;
  created_time: string;
  last_edited_time: string;
  has_children: boolean;
  archived: boolean;
}

export interface NotionBlockChildren {
  object: string;
  results: NotionBlock[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface NotionUser {
  object: string;
  id: string;
  type: string;
  name: string;
  avatar_url: string | null;
}

export interface NotionUserList {
  object: string;
  results: NotionUser[];
  has_more: boolean;
  next_cursor: string | null;
}
