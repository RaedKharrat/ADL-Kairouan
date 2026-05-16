const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/app/admin', function(filePath) {
  if (!filePath.endsWith('.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Cleanup bad replacements
  content = content.replace(/bg-slate-50\/50 dark:bg-slate-100\/50 dark:bg-black\/40/g, 'bg-slate-50/50 dark:bg-black/20');
  content = content.replace(/hover:bg-slate-50 dark:hover:bg-slate-100\/50 dark:bg-white\/5/g, 'hover:bg-slate-50 dark:hover:bg-white/5');
  content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-100\/50 dark:bg-white\/10/g, 'hover:bg-slate-100 dark:hover:bg-white/10');
  content = content.replace(/bg-slate-50\/50 dark:bg-slate-100\/50 dark:bg-black\/20/g, 'bg-slate-50/50 dark:bg-black/20');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Cleaned:', filePath);
  }
});
