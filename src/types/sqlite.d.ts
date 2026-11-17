declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
  export interface StatementSync {
    run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
    all(...params: any[]): any[];
    get(...params: any[]): any;
  }
}
