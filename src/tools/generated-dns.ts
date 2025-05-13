import { z } from "zod";
import { ConnectorManager } from "../connectors/manager.js";
import { createToolSuccessResponse } from "../utils/response-formatter.js";

interface GenerateDSNParams {
  type: "mysql"; // 数据库类型：mysql, postgresql, sqlite 等
  host?: string; // 主机地址
  port?: number; // 端口号
  database: string; // 数据库名
  username?: string; // 用户名
  password?: string; // 密码
}

export const GenerateDSNParams = {
  type: z.enum(["mysql"]),
  host: z.string().optional(),
  port: z.number().optional(),
  database: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
};

/**
 * generate_dsn tool handler
 * 根据提供的参数生成数据库连接字符串
 */
export async function generateDSNToolHandler(
  args: GenerateDSNParams,
  _extra: any
) {
  try {
    let dsn: string;

    switch (args.type.toLowerCase()) {
      case "mysql":
        dsn = generateMySQLDSN(args);
        break;
      default:
        throw new Error(`不支持的数据库类型: ${args.type}`);
    }

    // 验证生成的 DSN 是否有效
    try {
      const connector = ConnectorManager.getCurrentConnector();
      if (connector.dsnParser.isValidDSN(dsn)) {
        // 如果DSN有效，尝试连接数据库
        const connectorManager = new ConnectorManager();
        await connectorManager.connectWithDSN(dsn);
        
        return createToolSuccessResponse({
          dsn,
          isValid: true,
          type: args.type,
          connected: true
        });
      }
    } catch (error) {
      console.error("DSN 验证失败:", error);
    }

    return createToolSuccessResponse({
      dsn,
      isValid: false,
      type: args.type,
      connected: false
    });
  } catch (error) {
    throw new Error(`生成 DSN 失败: ${(error as Error).message}`);
  }
}

function generateMySQLDSN(params: GenerateDSNParams): string {
  const {
    host = "localhost",
    port = 3306,
    database,
    username = "root",
    password = "",
  } = params;

  const auth = password ? `${username}:${password}` : username;
  return `mysql://${auth}@${host}:${port}/${database}`;
}

function generateSQLiteDSN(params: GenerateDSNParams): string {
  const { database } = params;
  return `sqlite://${database}`;
}
