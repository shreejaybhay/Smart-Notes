#!/usr/bin/env node

/**
 * Automated script to update API calls to use the new apiFetch utility
 * This script will automatically update most files with the correct imports and API calls
 */

const fs = require('fs');
const path = require('path');

// Files to search in
const searchDirs = ['src'];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

// Pattern to find fetch calls with relative API paths
const fetchPattern = /fetch\s*\(\s*(['"`])\/api[^'"`]*\1/g;
const fetchWithOptionsPattern = /fetch\s*\(\s*(['"`])\/api[^'"`]*\1\s*,\s*\{[^}]*\}/g;

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

function updateFileContent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Check if file has fetch calls to API
  const hasFetchCalls = /fetch\s*\(\s*['"`]\/api/.test(content);
  if (!hasFetchCalls) {
    return { updated: false, changes: [] };
  }
  
  const changes = [];
  
  // Add import if not present
  const hasApiFetchImport = content.includes('apiFetch') || content.includes('@/lib/api');
  if (!hasApiFetchImport) {
    // Find the last import statement
    const importLines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].trim().startsWith('import ') && !importLines[i].includes('//')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      importLines.splice(lastImportIndex + 1, 0, 'import { apiFetch } from "@/lib/api";');
      content = importLines.join('\n');
      hasChanges = true;
      changes.push('Added apiFetch import');
    }
  }
  
  // Replace fetch calls with apiFetch
  const originalContent = content;
  
  // Replace simple fetch calls
  content = content.replace(
    /fetch\s*\(\s*(['"`])(\/api[^'"`]*)\1/g,
    'apiFetch($1$2$1'
  );
  
  // Replace fetch calls with options - remove Content-Type header
  content = content.replace(
    /fetch\s*\(\s*(['"`])(\/api[^'"`]*)\1\s*,\s*\{([^}]*)\}/g,
    (match, quote, apiPath, options) => {
      // Remove Content-Type header from options
      let cleanOptions = options.replace(/["']Content-Type["']\s*:\s*["']application\/json["']\s*,?\s*/g, '');
      
      // Clean up any trailing commas in headers
      cleanOptions = cleanOptions.replace(/headers\s*:\s*\{\s*,/g, 'headers: {');
      cleanOptions = cleanOptions.replace(/,\s*\}/g, ' }');
      
      // Remove empty headers object
      cleanOptions = cleanOptions.replace(/headers\s*:\s*\{\s*\}\s*,?\s*/g, '');
      
      return `apiFetch(${quote}${apiPath}${quote}, {${cleanOptions}}`;
    }
  );
  
  if (content !== originalContent) {
    hasChanges = true;
    changes.push('Updated fetch calls to use apiFetch');
  }
  
  return { updated: hasChanges, content, changes };
}

function main() {
  console.log('🚀 Starting automated API calls update...\n');
  
  const allFiles = [];
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      allFiles.push(...findFilesRecursively(dir, fileExtensions));
    }
  }
  
  let updatedCount = 0;
  const results = [];
  
  for (const file of allFiles) {
    try {
      const result = updateFileContent(file);
      if (result.updated) {
        fs.writeFileSync(file, result.content, 'utf8');
        updatedCount++;
        results.push({
          file,
          changes: result.changes
        });
        console.log(`✅ Updated: ${file}`);
        result.changes.forEach(change => {
          console.log(`   - ${change}`);
        });
      }
    } catch (error) {
      console.error(`❌ Error updating ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Update complete!`);
  console.log(`📊 Updated ${updatedCount} files`);
  
  if (updatedCount > 0) {
    console.log('\n📋 Summary of changes:');
    results.forEach(result => {
      console.log(`\n${result.file}:`);
      result.changes.forEach(change => {
        console.log(`  - ${change}`);
      });
    });
    
    console.log('\n⚠️  Please review the changes and test your application!');
    console.log('🔧 You may need to manually fix any complex fetch patterns that weren\'t automatically updated.');
  }
}

if (require.main === module) {
  main();
}