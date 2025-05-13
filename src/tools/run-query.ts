import { z } from "zod";
import { ConnectorManager } from "../connectors/manager.js";
import {
  createToolSuccessResponse,
  createToolErrorResponse,
} from "../utils/response-formatter.js";
import { MySQLConnector } from "../connectors/mysql/index.js";

// Schema for run_query tool
export const runQuerySchema = {
  query: z.string().describe("SQL query to execute (SELECT only)"),
  dns: z.string().optional().describe("DSN to use for connection"),
};

/**
 * run_query tool handler
 * Executes a SQL query and returns the results
 */
export async function runQueryToolHandler(
  _args: {
    query: string;
    dns?: string;
  },
  _extra: any
) {
  let connector;
  const { query, dns } = _args;
  if (dns) {
    const mySQLConnector = new MySQLConnector();

    await mySQLConnector.connect(dns);

    connector = mySQLConnector;
  } else {
    connector = ConnectorManager.getCurrentConnector();
  }

  try {
    // Validate the query before execution
    const validationResult = connector.validateQuery(query);

    if (!validationResult.isValid) {
      return createToolErrorResponse(
        validationResult.message ?? "Unknown validation error",
        "VALIDATION_ERROR"
      );
    }

    // Execute the query if validation passed
    const result = await connector.executeQuery(query);

    // Build response data
    const responseData = {
      rows: result.rows,
      count: result.rows.length,
    };

    return createToolSuccessResponse(responseData);
  } catch (error) {
    return createToolErrorResponse((error as Error).message, "EXECUTION_ERROR");
  }
}
