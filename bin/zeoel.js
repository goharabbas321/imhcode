#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 Initializing Zeoel AI Agency Framework...\n');

const sourceDir = path.join(__dirname, '..', '.agents');
const targetDir = path.join(process.cwd(), '.agents');

if (!fs.existsSync(sourceDir)) {
  console.error('❌ Error: Could not find Zeoel .agents directory in package.');
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.log('⚠️ Zeoel is already initialized in this directory (.agents folder exists).');
  process.exit(0);
}

try {
  // Safe copy command cross-platform compatible
  console.log('Copying 22 specialized agents and 150+ skills into your project...');
  execSync(`cp -r "${sourceDir}" "${targetDir}"`);
  
  console.log('\n✅ Successfully initialized Zeoel Framework!');
  console.log('----------------------------------------------------');
  console.log('You are now the Product Owner.');
  console.log('To start building, open your AI coding assistant (Cursor, Copilot, Claude Code) and say:\n');
  console.log('  "I want to build a SaaS for [your idea]"\n');
  console.log('Zeoel will handle the brainstorming, sprint planning, and task execution automatically.');
  console.log('----------------------------------------------------\n');
} catch (error) {
  console.error('❌ Failed to copy Zeoel framework files:', error.message);
  process.exit(1);
}
