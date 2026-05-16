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

  // Global replacements for hardcoded dark-mode-only classes
  
  // 1. Container Cards
  content = content.replace(/glass-card rounded-2xl border-white\/5/g, 'bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none');
  content = content.replace(/glass-card rounded-xl border-white\/5/g, 'bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-sm');
  
  // 2. Table Headers & Footers (bg-black/10)
  // Be careful not to replace it if it's already fixed
  content = content.replace(/bg-black\/10/g, 'bg-slate-50/50 dark:bg-black/20');
  
  // 3. Borders
  // Need to be careful with border-white/5 to not replace already fixed dark:border-white/5
  content = content.replace(/(?<!dark:)border-white\/5/g, 'border-slate-200/50 dark:border-white/5');
  content = content.replace(/(?<!dark:)border-white\/10/g, 'border-slate-200 dark:border-white/10');
  
  // 4. Dividers
  content = content.replace(/(?<!dark:)divide-white\/5/g, 'divide-slate-200/50 dark:divide-white/5');
  
  // 5. Table Thead
  content = content.replace(/bg-black\/20/g, 'bg-slate-100/50 dark:bg-black/40');
  
  // 6. Hover Backgrounds
  content = content.replace(/(?<!dark:)hover:bg-white\/5/g, 'hover:bg-slate-50 dark:hover:bg-white/5');
  content = content.replace(/(?<!dark:)hover:bg-white\/10/g, 'hover:bg-slate-100 dark:hover:bg-white/10');
  
  // 7. Backgrounds for inputs
  content = content.replace(/(?<!dark:)bg-white\/5/g, 'bg-slate-100/50 dark:bg-white/5');
  
  // 8. Text colors
  content = content.replace(/text-white group-hover:text-brand-400/g, 'text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400');
  content = content.replace(/text-white group-hover:text-purple-400/g, 'text-slate-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400');
  content = content.replace(/(?<!dark:)hover:text-white(?! )/g, 'hover:text-slate-900 dark:hover:text-white');
  
  // 9. Buttons
  content = content.replace(/h-8 bg-transparent border-white\/10/g, 'h-9 rounded-xl bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5');
  
  // 10. Empty state rows text color
  content = content.replace(/text-muted-foreground/g, 'text-slate-500 dark:text-slate-400'); // Note: muted-foreground might already handle dark mode, but slate-500/400 is safer and matches our redesign. Actually wait, text-muted-foreground is fine, but let's make it look more premium.
  content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-slate-500 dark:text-slate-400'); // Deduplicate if ran multiple times

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated:', filePath);
  }
});
