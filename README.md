# Notion MCP Server

A Model Context Protocol (MCP) server that provides full access to the Notion API. Search, create, and manage databases, pages, blocks, and users directly from Claude, Cursor, or any MCP-compatible client.

## Features

- **Search** - Full-text search across all pages and databases
- **Database Management** - Create databases, query with filters and sorts
- **Page Management** - Create, read, update, and archive pages
- **Block Management** - Read, append, and delete content blocks
- **User Access** - List workspace members and get user details
- **Built-in Rate Limiting** - Automatic throttling (3 req/s) with 429 retry

## Available Tools (13)

| Tool | Description |
|------|-------------|
| `notion_search` | Search across all pages and databases |
| `notion_get_database` | Get database schema and details |
| `notion_query_database` | Query database with filters and sorting |
| `notion_create_database` | Create a new database in a page |
| `notion_create_page` | Create a new page in a database or page |
| `notion_get_page` | Get page properties and metadata |
| `notion_update_page` | Update page properties or archive |
| `notion_get_block` | Get a block by ID |
| `notion_get_block_children` | Get child blocks of a page or block |
| `notion_append_block_children` | Append content blocks to a page |
| `notion_delete_block` | Delete (archive) a block |
| `notion_list_users` | List all workspace users |
| `notion_get_user` | Get user details by ID |

## Quick Start

```bash
npx @cloud9-labs/mcp-notion
```

## Prerequisites

- Node.js >= 20.0.0
- Notion Internal Integration token from [My Integrations](https://www.notion.so/my-integrations)

### Setting Up Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name and select a workspace
4. Copy the Internal Integration Token
5. Share target pages/databases with the integration

## Installation

### Via npx (Recommended)

No installation needed - configure your MCP client to use npx.

### Via npm

```bash
npm i -g @cloud9-labs/mcp-notion
```

### From Source

```bash
git clone https://github.com/cloud9-labs/mcp-notion.git
cd mcp-notion
npm ci
npm run build
```

## Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@cloud9-labs/mcp-notion"],
      "env": {
        "NOTION_API_KEY": "ntn_your_integration_token_here"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@cloud9-labs/mcp-notion"],
      "env": {
        "NOTION_API_KEY": "ntn_your_integration_token_here"
      }
    }
  }
}
```

## Usage Examples

- "Search for all pages about marketing"
- "Query the Tasks database for items assigned to me"
- "Create a new page in database abc123 with title Meeting Notes"
- "Add a paragraph block to page xyz789"
- "List all users in the workspace"
- "Get the schema of database def456"

## Building an AI Sales Automation System?

This MCP server is part of an open-source toolkit for AI-powered sales automation. We are building MCP servers that connect your entire sales stack.

Follow our progress and get updates:

- **X (Twitter)**: [@cloud9_ai_labs](https://x.com/cloud9_ai_labs)
- **GitHub**: [cloud9-labs](https://github.com/cloud9-labs)

## License

MIT
