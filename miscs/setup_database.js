/**
 * Database Setup Script
 * 
 * This script will:
 * 1. Test the database connection
 * 2. Create any missing tables (including cover_letters)
 * 3. Verify the schema is correct
 * 
 * Run with: node setup_database.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables manually for this script
require('dotenv').config({ path: '.env.local' });

class DatabaseSetup {
  constructor() {
    this.config = {
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
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const colors = {
      'INFO': '\x1b[36m',
      'SUCCESS': '\x1b[32m',
      'ERROR': '\x1b[31m',
      'WARNING': '\x1b[33m',
      'RESET': '\x1b[0m'
    };
    console.log(`${colors[type]}[${timestamp}] ${type}: ${message}${colors.RESET}`);
  }

  async testConnection() {
    this.log('Testing database connection...', 'INFO');
    
    try {
      // Remove database from config to test server connection first
      const serverConfig = { ...this.config };
      delete serverConfig.database;
      
      const connection = await mysql.createConnection(serverConfig);
      this.log('✅ Database server connection successful', 'SUCCESS');
      
      // Test database connection
      await connection.execute(`USE \`${this.config.database}\``);
      this.log(`✅ Database '${this.config.database}' exists and accessible`, 'SUCCESS');
      
      await connection.end();
      return true;
      
    } catch (error) {
      if (error.code === 'ER_BAD_DB_ERROR') {
        this.log(`❌ Database '${this.config.database}' does not exist`, 'ERROR');
        return await this.createDatabase();
      } else {
        this.log(`❌ Database connection failed: ${error.message}`, 'ERROR');
        this.log(`Config used: ${JSON.stringify({
          host: this.config.host,
          user: this.config.user,
          database: this.config.database,
          port: this.config.port
        }, null, 2)}`, 'ERROR');
        return false;
      }
    }
  }

  async createDatabase() {
    this.log(`Creating database '${this.config.database}'...`, 'INFO');
    
    try {
      const serverConfig = { ...this.config };
      delete serverConfig.database;
      
      const connection = await mysql.createConnection(serverConfig);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${this.config.database}\``);
      await connection.end();
      
      this.log(`✅ Database '${this.config.database}' created successfully`, 'SUCCESS');
      return true;
      
    } catch (error) {
      this.log(`❌ Failed to create database: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async setupTables() {
    this.log('Setting up database tables...', 'INFO');
    
    try {
      const connection = await mysql.createConnection(this.config);
      
      // Read the schema file
      const schemaPath = path.join(__dirname, 'src', 'lib', 'database', 'schema.sql');
      if (!fs.existsSync(schemaPath)) {
        this.log(`❌ Schema file not found: ${schemaPath}`, 'ERROR');
        return false;
      }
      
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split schema into individual statements
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed) {
          try {
            await connection.execute(trimmed);
            
            // Extract table name for logging
            const createTableMatch = trimmed.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i);
            if (createTableMatch) {
              this.log(`✅ Table '${createTableMatch[1]}' created/verified`, 'SUCCESS');
            }
          } catch (error) {
            if (error.code === 'ER_TABLE_EXISTS_ERROR') {
              // Table already exists, that's fine
              const createTableMatch = trimmed.match(/CREATE TABLE `?(\w+)`?/i);
              if (createTableMatch) {
                this.log(`ℹ️  Table '${createTableMatch[1]}' already exists`, 'INFO');
              }
            } else {
              this.log(`❌ Error executing statement: ${error.message}`, 'ERROR');
              this.log(`Statement: ${trimmed.substring(0, 100)}...`, 'ERROR');
            }
          }
        }
      }
      
      await connection.end();
      return true;
      
    } catch (error) {
      this.log(`❌ Failed to setup tables: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async verifyTables() {
    this.log('Verifying database tables...', 'INFO');
    
    try {
      const connection = await mysql.createConnection(this.config);
      
      const requiredTables = [
        'users',
        'resumes', 
        'cover_letters',
        'resume_templates'
      ];
      
      for (const tableName of requiredTables) {
        try {
          const [rows] = await connection.execute(
            'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
            [this.config.database, tableName]
          );
          
          if (rows[0].count > 0) {
            this.log(`✅ Table '${tableName}' exists`, 'SUCCESS');
          } else {
            this.log(`❌ Table '${tableName}' missing`, 'ERROR');
          }
        } catch (error) {
          this.log(`❌ Error checking table '${tableName}': ${error.message}`, 'ERROR');
        }
      }
      
      // Specifically check cover_letters table structure
      try {
        const [columns] = await connection.execute(
          'DESCRIBE cover_letters'
        );
        this.log(`✅ Cover letters table structure:`, 'SUCCESS');
        columns.forEach(col => {
          this.log(`   - ${col.Field}: ${col.Type}`, 'INFO');
        });
      } catch (error) {
        this.log(`❌ Could not describe cover_letters table: ${error.message}`, 'ERROR');
      }
      
      await connection.end();
      return true;
      
    } catch (error) {
      this.log(`❌ Failed to verify tables: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async testWorkflowQueries() {
    this.log('Testing workflow-related queries...', 'INFO');
    
    try {
      const connection = await mysql.createConnection(this.config);
      
      // Test resume loading query
      try {
        const [resumes] = await connection.execute(
          'SELECT id, title, resume_data FROM resumes LIMIT 1'
        );
        if (resumes.length > 0) {
          this.log(`✅ Found ${resumes.length} resume(s) in database`, 'SUCCESS');
        } else {
          this.log(`⚠️  No resumes found in database`, 'WARNING');
          this.log(`💡 Create a resume in the builder to test the workflow`, 'INFO');
        }
      } catch (error) {
        this.log(`❌ Error querying resumes: ${error.message}`, 'ERROR');
      }
      
      // Test cover letters table
      try {
        const [coverLetters] = await connection.execute(
          'SELECT COUNT(*) as count FROM cover_letters'
        );
        this.log(`✅ Cover letters table accessible, contains ${coverLetters[0].count} records`, 'SUCCESS');
      } catch (error) {
        this.log(`❌ Error querying cover_letters: ${error.message}`, 'ERROR');
      }
      
      await connection.end();
      return true;
      
    } catch (error) {
      this.log(`❌ Failed to test workflow queries: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async runSetup() {
    this.log('🚀 Starting database setup...', 'INFO');
    
    // Step 1: Test connection and create database if needed
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      this.log('❌ Database connection failed. Cannot continue.', 'ERROR');
      return false;
    }
    
    // Step 2: Setup tables
    const tablesOk = await this.setupTables();
    if (!tablesOk) {
      this.log('❌ Table setup failed.', 'ERROR');
      return false;
    }
    
    // Step 3: Verify tables
    await this.verifyTables();
    
    // Step 4: Test workflow queries
    await this.testWorkflowQueries();
    
    this.log('✅ Database setup completed!', 'SUCCESS');
    this.log('💡 You can now test the cover letter workflow', 'INFO');
    
    return true;
  }
}

// Run the setup
if (require.main === module) {
  // Check if dotenv is available
  try {
    require('dotenv');
  } catch (error) {
    console.log('Installing dotenv for environment variable support...');
    require('child_process').execSync('npm install dotenv', { stdio: 'inherit' });
    require('dotenv').config({ path: '.env.local' });
  }
  
  const setup = new DatabaseSetup();
  setup.runSetup().catch(console.error);
}

module.exports = DatabaseSetup;
