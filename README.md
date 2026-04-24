# MCP Frontmatter Auditor

A custom Model Context Protocol (MCP) server designed to enforce metadata integrity in **Astro** and **Starlight** documentation projects.

## 📋 The Problem
As documentation moves toward "Docs-as-Code," teams increasingly rely on AI agents (like Claude or GPT) to generate content. However, these agents often "hallucinate" or omit critical frontmatter (YAML metadata) such as `title` and `description`, which are required for SEO and site indexing. 

## 🛠️ The Solution
The **Frontmatter Auditor** acts as a "Quality Gate" by providing a local tool that AI agents can programmatically invoke. It allows the agent to:
1. **Access** the local filesystem securely via MCP.
2. **Scan** Markdown/MDX files for required frontmatter fields.
3. **Report** precise errors back to the agent before a commit is ever made.

## 🏗️ Technical Stack
- **Language:** TypeScript
- **Runtime:** Node.js
- **Protocol:** Model Context Protocol (MCP)
- **Methodology:** Shift-Left Validation

## 🔧 Installation & Setup

### Prerequisites
- [Claude Desktop App](https://claude.ai/download)
- Node.js (v18+)

### Configuration
Add this server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "frontmatter-auditor": {
      "command": "node",
      "args": [
        "D:/github/mcp-frontmatter-audit/dist/index.js"
      ]
    }
  }
}
