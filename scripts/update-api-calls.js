#!/usr/bin/env node

/**
 * Script to help identify and update API calls to use the new apiFetch utility
 * Run this script to see all the files that need to be updated
 */

const fs = require('fs');
const path = require('path');

// Files to search in
const searchDirs = ['src'];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

// Pattern to find fetch calls with relative API paths
const fetchPattern = /fetch\s*\(\s*['"`]\/api[^'"`]*['"`]/g;

function findFilesRecursively(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(fetchPattern);
  
  if (matches) {
    return {
      file: filePath,
      matches: matches,
      hasApiFetchImport: content.includes('apiFetch') || content.includes('@/lib/api')
    };
  }
  
  return null;
}

function main() {
  console.log('🔍 Scanning for API calls that need to be updated...\n');
  
  const allFiles = [];
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      allFiles.push(...findFilesRecursively(dir, fileExtensions));
    }
  }
  
  const filesToUpdate = [];
  
  for (const file of allFiles) {
    const analysis = analyzeFile(file);
    if (analysis) {
      filesToUpdate.push(analysis);
    }
  }
  
  if (filesToUpdate.length === 0) {
    console.log('✅ No files found with API calls that need updating!');
    return;
  }
  
  console.log(`📋 Found ${filesToUpdate.length} files with API calls to update:\n`);
  
  filesToUpdate.forEach((fileInfo, index) => {
    console.log(`${index + 1}. ${fileInfo.file}`);
    console.log(`   ${fileInfo.hasApiFetchImport ? '✅' : '❌'} Has apiFetch import`);
    console.log(`   API calls found:`);
    fileInfo.matches.forEach(match => {
      console.log(`     - ${match.trim()}`);
    });
    console.log('');
  });
  
  console.log('📝 To update these files:');
  console.log('1. Add import: import { apiFetch } from "@/lib/api";');
  console.log('2. Replace fetch("/api/...") with apiFetch("/api/...")');
  console.log('3. Remove "Content-Type": "application/json" headers (handled automatically)');
  console.log('\n🚀 Example:');
  console.log('  Before: fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })');
  console.log('  After:  apiFetch("/api/notes", { method: "POST", body: JSON.stringify(data) })');
}

if (require.main === module) {
  main();
}