const fs = require('fs');
const path = require('path');

const directories = [
  'src/app/pages',
  'src/app/context',
  'src/app/components',
  'src/app/lib'
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.startsWith('"use client";') && !content.startsWith("'use client';")) {
        // Skip some files if needed, but for now everything in src/app is likely a client component
        // except maybe some utility functions in lib. Actually lib functions don't STRICTLY need "use client"
        // unless they use react hooks. Let's just add it to components, pages, context.
        if (dir.includes('lib') || dir.includes('utils')) continue;

        fs.writeFileSync(fullPath, '"use client";\n' + content);
        console.log(`Added "use client" to ${fullPath}`);
      }
    }
  }
}

// Ensure localApi.ts and supabase.ts don't get 'use client' since they are just modules.
// Layout.tsx we created LayoutShell.tsx, so we don't need to change old routes.tsx.

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});
