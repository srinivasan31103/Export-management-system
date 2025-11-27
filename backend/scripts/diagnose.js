import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('🔍 ExportSuite Server Diagnostics\n');
console.log('='.repeat(60));

// Check 1: Environment Variables
console.log('\n1️⃣  Environment Variables:');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development (default)');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ NOT SET');
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:5173 (default)');

// Check 2: Required Files
console.log('\n2️⃣  Required Files:');
const requiredFiles = [
  '../config/db.js',
  '../models/index.js',
  '../models/User.js',
  '../server.js',
  '../middleware/errorHandler.js',
  '../src/services/websocket.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
});

// Check 3: MongoDB Connection
console.log('\n3️⃣  MongoDB Connection Test:');
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exportsuite';
console.log(`   Connecting to: ${mongoUri}`);

try {
  await mongoose.connect(mongoUri);
  console.log('   ✓ MongoDB connection successful');
  console.log(`   Database: ${mongoose.connection.name}`);
  console.log(`   Host: ${mongoose.connection.host}`);
  console.log(`   Port: ${mongoose.connection.port}`);

  // Check collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`\n   Collections (${collections.length}):`);
  if (collections.length === 0) {
    console.log('   ⚠️  No collections found. Run "npm run seed" to create data.');
  } else {
    collections.forEach(col => console.log(`     - ${col.name}`));
  }

  await mongoose.connection.close();
  console.log('\n   ✓ Connection closed');

} catch (error) {
  console.log('   ✗ MongoDB connection failed!');
  console.log('   Error:', error.message);

  if (error.message.includes('ECONNREFUSED')) {
    console.log('\n   💡 Solution: Start MongoDB service');
    console.log('      Windows: services.msc → MongoDB Server → Start');
    console.log('      macOS: brew services start mongodb-community');
    console.log('      Linux: sudo systemctl start mongod');
  }
}

// Check 4: Dependencies
console.log('\n4️⃣  Key Dependencies:');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
  );

  const keyDeps = [
    'express',
    'mongoose',
    'socket.io',
    'jsonwebtoken',
    'bcrypt',
    'cors'
  ];

  keyDeps.forEach(dep => {
    const version = packageJson.dependencies[dep];
    console.log(`   ${version ? '✓' : '✗'} ${dep}${version ? `: ${version}` : ''}`);
  });

} catch (error) {
  console.log('   ✗ Could not read package.json');
}

// Check 5: Model Files
console.log('\n5️⃣  Model Files:');
const modelsDir = path.join(__dirname, '../models');
try {
  const modelFiles = fs.readdirSync(modelsDir)
    .filter(f => f.endsWith('.js'))
    .filter(f => f !== 'index.js');

  console.log(`   Found ${modelFiles.length} model files:`);
  modelFiles.forEach(file => console.log(`     ✓ ${file}`));

} catch (error) {
  console.log('   ✗ Could not read models directory');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 Summary:');
console.log('   To start the server:');
console.log('     1. Ensure MongoDB is running');
console.log('     2. Run: npm install');
console.log('     3. Run: npm run seed (first time only)');
console.log('     4. Run: npm run dev');
console.log('\n   If errors persist, check:');
console.log('     - MongoDB service status');
console.log('     - MONGODB_URI in .env file');
console.log('     - All dependencies installed');
console.log('='.repeat(60));

process.exit(0);
