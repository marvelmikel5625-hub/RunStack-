import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { ExecutionResult, Diagnostic } from '../../types/diagnostics';

class SqlEngineService {
  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;
  private isInitializing: boolean = false;

  public async initialize(): Promise<SqlJsStatic> {
    if (this.SQL) return this.SQL;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (this.SQL) return this.SQL;
    }

    this.isInitializing = true;
    try {
      const sqlStatic = await initSqlJs({
        locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`,
      });
      this.SQL = sqlStatic;
      this.db = new sqlStatic.Database();
      this.isInitializing = false;
      return sqlStatic;
    } catch (err) {
      this.isInitializing = false;
      console.error('Failed to initialize sql.js:', err);
      throw err;
    }
  }

  public resetDatabase(): void {
    if (this.SQL) {
      if (this.db) {
        this.db.close();
      }
      this.db = new this.SQL.Database();
    }
  }

  public async runSql(queryText: string): Promise<{ result: ExecutionResult; diagnostics: Diagnostic[] }> {
    const startTime = performance.now();

    try {
      await this.initialize();
      if (!this.db) {
        throw new Error('SQLite database not initialized.');
      }

      // Execute queries
      const res = this.db.exec(queryText);
      const elapsed = Math.round(performance.now() - startTime);

      if (res.length === 0) {
        return {
          result: {
            success: true,
            stdout: 'Query executed successfully. (0 rows returned or DDL statement executed)',
            executionTimeMs: elapsed,
          },
          diagnostics: [],
        };
      }

      // Format last result or all results
      const allRows: Array<Record<string, unknown>> = [];
      let lastColumns: string[] = [];

      let formattedOutput = '';
      res.forEach((tableResult, idx) => {
        formattedOutput += `Result Set #${idx + 1} (${tableResult.values.length} rows):\n`;
        lastColumns = tableResult.columns;
        
        tableResult.values.forEach((rowVals) => {
          const rowObj: Record<string, unknown> = {};
          tableResult.columns.forEach((col, cIdx) => {
            rowObj[col] = rowVals[cIdx];
          });
          allRows.push(rowObj);
        });
      });

      return {
        result: {
          success: true,
          columns: lastColumns,
          outputRows: allRows,
          stdout: `Executed ${res.length} statement(s) successfully in ${elapsed}ms.`,
          executionTimeMs: elapsed,
        },
        diagnostics: [],
      };
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - startTime);
      const rawError = err instanceof Error ? err.message : String(err);

      const diagnostics: Diagnostic[] = [
        {
          id: 'sql_err_' + Date.now(),
          file: 'query.sql',
          line: 1,
          column: 1,
          message: rawError,
          severity: 'error',
          source: 'runtime',
        },
      ];

      return {
        result: {
          success: false,
          error: rawError,
          stderr: rawError,
          executionTimeMs: elapsed,
        },
        diagnostics,
      };
    }
  }
}

export const sqlEngine = new SqlEngineService();
