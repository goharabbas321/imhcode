#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 Initializing Zeoel AI Agency Framework...\n');

const packageRoot = path.join(__dirname, '..');
const cwd = process.cwd();

const itemsToCopy = [
  { src: '.agents', dest: '.agents', desc: '22 specialized agents and 150+ skills' },
  { src: '.github', dest: '.github', desc: 'Copilot and GitHub integration files' },
  { src: 'AGENTS.md', dest: 'AGENTS.md', desc: 'Agent manifest' },
  { src: 'CLAUDE.md', dest: 'CLAUDE.md', desc: 'Claude and Cursor integration file' }
];

try {
  let copiedSomething = false;

  for (const item of itemsToCopy) {
    const sourcePath = path.join(packageRoot, item.src);
    const targetPath = path.join(cwd, item.dest);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️ Warning: Could not find ${item.src} in package.`);
      continue;
    }

    if (fs.existsSync(targetPath)) {
      console.log(`⚠️ ${item.dest} already exists in this directory. Skipping...`);
      continue;
    }

    console.log(`Copying ${item.src} (${item.desc})...`);
    execSync(`cp -r "${sourcePath}" "${targetPath}"`);
    copiedSomething = true;
  }

  if (copiedSomething) {
    console.log('\n✅ Successfully initialized Zeoel Framework!');
    console.log('----------------------------------------------------');
    console.log('You are now the Product Owner.');
    console.log('To start building, open your AI coding assistant (Cursor, Copilot, Claude Code) and say:\n');
    console.log('  "I want to build a SaaS for [your idea]"\n');
    console.log('Zeoel will handle the brainstorming, sprint planning, and task execution automatically.');
    console.log('----------------------------------------------------\n');
  } else {
    console.log('\n✅ Zeoel Framework is already fully initialized in this directory.');
  }
} catch (error) {
  console.error('❌ Failed to copy Zeoel framework files:', error.message);
  process.exit(1);
}
