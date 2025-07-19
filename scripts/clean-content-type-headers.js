#!/usr/bin/env node

/**
 * Script to remove unnecessary Content-Type headers from apiFetch calls
 * Since apiFetch automatically adds the Content-Type header, we don't need to specify it manually
 */

const fs = require('fs');
const path = require('path');

// Files to search in
const searchDirs = ['src'];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

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

function cleanContentTypeHeaders(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Remove Content-Type headers from apiFetch calls
  content = content.replace(
    /(\s+)["']Content-Type["']\s*:\s*["']application\/json["']\s*,?\s*/g,
    ''
  );
  
  // Clean up empty headers objects
  content = content.replace(/headers\s*:\s*\{\s*\}\s*,?\s*/g, '');
  
  // Clean up trailing commas in headers
  content = content.replace(/headers\s*:\s*\{\s*,/g, 'headers: {');
  content = content.replace(/,(\s*)\}/g, '$1}');
  
  // Clean up empty lines that might have been created
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return {
    updated: content !== originalContent,
    content
  };
}

function main() {
  console.log('🧹 Cleaning up unnecessary Content-Type headers...\n');
  
  const allFiles = [];
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      allFiles.push(...findFilesRecursively(dir, fileExtensions));
    }
  }
  
  let updatedCount = 0;
  
  for (const file of allFiles) {
    try {
      const result = cleanContentTypeHeaders(file);
      if (result.updated) {
        fs.writeFileSync(file, result.content, 'utf8');
        updatedCount++;
        console.log(`✅ Cleaned: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error cleaning ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Cleanup complete!`);
  console.log(`📊 Updated ${updatedCount} files`);
  
  if (updatedCount > 0) {
    console.log('\n✨ Removed unnecessary Content-Type headers from apiFetch calls');
    console.log('🔧 The apiFetch utility automatically handles Content-Type headers');
  }
}

if (require.main === module) {
  main();
}