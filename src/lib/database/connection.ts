import mysql from 'mysql2/promise';

// Database configuration for different environments
const getDatabaseConfig = () => {
  // Production environment (Vercel, Railway, etc.)
  if (process.env.NODE_ENV === 'production') {
    return {
      host: process.env.DB_HOST || process.env.MYSQL_HOST,
      user: process.env.DB_USER || process.env.MYSQL_USER,
      password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
      database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
      port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };
  }

  // Development environment
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'resume_builder',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  };
};

// Create connection pool
let pool: mysql.Pool | null = null;

export const getConnection = async (): Promise<mysql.Pool> => {
  if (!pool) {
    const config = getDatabaseConfig();
    
    console.log('Database connection config:', {
      host: config.host,
      user: config.user,
      database: config.database,
      port: config.port,
      ssl: config.ssl ? 'enabled' : 'disabled'
    });

    pool = mysql.createPool(config);

    // Test the connection
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  return pool;
};

// Execute a query with error handling
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
};

// Execute a transaction
export const executeTransaction = async (queries: { query: string; params: any[] }[]): Promise<any[]> => {
  const connection = await getConnection();
  const conn = await connection.getConnection();
  
  try {
    await conn.beginTransaction();
    const results = [];
    
    for (const { query, params } of queries) {
      const [rows] = await conn.execute(query, params);
      results.push(rows);
    }
    
    await conn.commit();
    return results;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// Close the connection pool
export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

// Health check for database
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await executeQuery('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};
