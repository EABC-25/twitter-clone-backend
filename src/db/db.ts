import {
  createPool,
  type PoolOptions,
  type Pool,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

class MySQL {
  private conn: Pool;
  private credentials: PoolOptions;

  constructor(credentials: PoolOptions) {
    this.credentials = credentials;
    this.conn = createPool(this.credentials);
  }

  public async connect() {
    try {
      const connection = await this.conn.getConnection();
      console.log("✅ Connected to this server's MySQL database.");
      connection.release();
    } catch (error) {
      console.error("❌ Failed to connect to MySQL:", error);
    }
  }

  /** A random method to simulate a step before to get the class methods */
  private ensureConnection() {
    if (!this?.conn) this.conn = createPool(this.credentials);
  }

  /** For `SELECT` and `SHOW` */
  public queryRows(sql: string, values?: any): Promise<[RowDataPacket[], any]> {
    this.ensureConnection();
    return this.conn.query<RowDataPacket[]>(sql, values);
  }

  /** For `SELECT` and `SHOW` with `rowAsArray` as `true` */
  public queryRowsAsArray(
    sql: string,
    values?: any
  ): Promise<[RowDataPacket[][], any]> {
    this.ensureConnection();
    return this.conn.query<RowDataPacket[][]>(sql, values);
  }

  /** For `INSERT`, `UPDATE`, etc. */
  public queryResult(
    sql: string,
    values?: any
  ): Promise<[ResultSetHeader, any]> {
    this.ensureConnection();
    return this.conn.query<ResultSetHeader>(sql, values);
  }

  /** For multiple `INSERT`, `UPDATE`, etc. with `multipleStatements` as `true` */
  public queryResults(
    sql: string,
    values?: any
  ): Promise<[ResultSetHeader[], any]> {
    this.ensureConnection();
    return this.conn.query<ResultSetHeader[]>(sql, values);
  }

  /** For `SELECT` and `SHOW` */
  public executeRows(
    sql: string,
    values?: any
  ): Promise<[RowDataPacket[], any]> {
    this.ensureConnection();
    return this.conn.execute<RowDataPacket[]>(sql, values);
  }

  /** For `SELECT` and `SHOW` with `rowAsArray` as `true` */
  public executeRowsAsArray(
    sql: string,
    values?: any
  ): Promise<[RowDataPacket[][], any]> {
    this.ensureConnection();
    return this.conn.execute<RowDataPacket[][]>(sql, values);
  }

  /** For `INSERT`, `UPDATE`, etc. */
  public executeResult(
    sql: string,
    values?: any
  ): Promise<[ResultSetHeader, any]> {
    this.ensureConnection();
    return this.conn.execute<ResultSetHeader>(sql, values);
  }

  /** For multiple `INSERT`, `UPDATE`, etc. with `multipleStatements` as `true` */
  public executeResults(
    sql: string,
    values?: any
  ): Promise<[ResultSetHeader[], any]> {
    this.ensureConnection();
    return this.conn.execute<ResultSetHeader[]>(sql, values);
  }

  /** Expose the Pool Connection */
  public getPool() {
    return this.conn;
  }
}

export default MySQL;
