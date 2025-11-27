import { sequelize } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test database connection
 */
const testConnection = async () => {
  console.log('🔍 Testing Database Connection...\n');

  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'exportsuite'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '***set***' : '***NOT SET***'}\n`);

  try {
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ Database connection successful!\n');

    // Test query
    const [results] = await sequelize.query('SELECT version();');
    console.log('PostgreSQL Version:', results[0].version);

    // List databases
    const [databases] = await sequelize.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false;"
    );
    console.log('\nAvailable Databases:');
    databases.forEach(db => console.log(`  - ${db.datname}`));

    // Check if tables exist
    const [tables] = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
    );

    console.log('\nTables in "exportsuite" database:');
    if (tables.length === 0) {
      console.log('  ⚠️  No tables found! Run "npm run seed" to create tables.\n');
    } else {
      tables.forEach(table => console.log(`  ✓ ${table.tablename}`));
      console.log(`\n✅ Found ${tables.length} tables\n`);
    }

    console.log('✅ All checks passed! Database is ready.\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database connection failed!\n');

    if (error.message.includes('password authentication failed')) {
      console.error('ERROR: Invalid database password');
      console.error('SOLUTION: Update DB_PASSWORD in backend/.env file\n');
    } else if (error.message.includes('database "exportsuite" does not exist')) {
      console.error('ERROR: Database "exportsuite" does not exist');
      console.error('SOLUTION: Create the database using pgAdmin or:');
      console.error('  psql -U postgres -c "CREATE DATABASE exportsuite;"\n');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('ERROR: Cannot connect to PostgreSQL server');
      console.error('SOLUTION: Start PostgreSQL service:');
      console.error('  Windows: Services → postgresql-x64-15 → Start');
      console.error('  Mac: brew services start postgresql');
      console.error('  Linux: sudo systemctl start postgresql\n');
    } else if (error.message.includes('role') && error.message.includes('does not exist')) {
      console.error('ERROR: Database user does not exist');
      console.error('SOLUTION: Update DB_USER in backend/.env file\n');
    } else {
      console.error('ERROR:', error.message);
      console.error('\nFull error:');
      console.error(error);
    }

    console.error('\n💡 Quick fixes:');
    console.error('1. Check PostgreSQL is running');
    console.error('2. Verify credentials in backend/.env');
    console.error('3. Create database: CREATE DATABASE exportsuite;');
    console.error('4. Run seed script: npm run seed\n');

    process.exit(1);
  }
};

testConnection();
