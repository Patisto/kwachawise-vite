declare module "sql.js" {
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  export interface Database {
    run(sql: string, params?: any[]): { lastInsertRowid: number; changes: number };
    exec(sql: string): void;
    prepare(sql: string): Statement;
    close(): void;
    export(): Uint8Array;
  }

  export interface Statement {
    bind(params: any[]): void;
    step(): boolean;
    getAsObject(): Record<string, any>;
    free(): void;
  }

  export default function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;
}
