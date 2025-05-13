import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runQueryToolHandler, runQuerySchema } from './run-query.js';
import { listConnectorsToolHandler } from './list-connectors.js';
import { generateDSNToolHandler, GenerateDSNParams } from './generated-dns.js';

/**
 * Register all tool handlers with the MCP server
 */
export function registerTools(server: McpServer): void {
  // Tool to run a SQL query (read-only for safety)
  server.tool(
    "run_query",
    "运行一个SQL查询, 只允许查询, 不允许修改数据只接收一个JSON格式的对象",
    runQuerySchema,
    runQueryToolHandler
  );

  // Tool to list available database connectors
  // server.tool(
  //   "generate_dsn",
  //   "获取一个包含DNS属性的JSON格式的对象",
  //   GenerateDSNParams,
  //   generateDSNToolHandler
  // );
}