const fs = require('fs');
const path = require('path');

const directories = [
  'src/app/pages',
  'src/app/components',
  'src/app/context'
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;

      // Replace Link import
      if (content.includes('import { Link } from "react-router";')) {
        content = content.replace('import { Link } from "react-router";', 'import Link from "next/link";');
        modified = true;
      } else if (content.includes('import { Link,')) {
        content = content.replace('import { Link,', 'import Link from "next/link";\nimport {');
        modified = true;
      } else if (content.includes(', Link } from "react-router"')) {
        content = content.replace(', Link } from "react-router"', ' } from "react-router"\nimport Link from "next/link";');
        modified = true;
      }

      // Replace other hooks
      if (content.includes('from "react-router"')) {
        content = content.replace(/import \{([^}]+)\} from "react-router";?/g, (match, p1) => {
          let imports = p1.split(',').map(s => s.trim());
          let nextImports = [];
          
          if (imports.includes('useNavigate')) nextImports.push('useRouter');
          if (imports.includes('useLocation')) nextImports.push('usePathname');
          if (imports.includes('useParams')) nextImports.push('useParams');
          
          // Remove Link if it's there
          imports = imports.filter(i => i !== 'Link');

          if (nextImports.length > 0) {
            return `import { ${nextImports.join(', ')} } from "next/navigation";`;
          }
          return '';
        });
        modified = true;
      }

      // Replace variable names/calls
      if (content.includes('useNavigate()')) {
        content = content.replace(/const navigate = useNavigate\(\);?/g, 'const router = useRouter();');
        content = content.replace(/navigate\(/g, 'router.push(');
        modified = true;
      }

      if (content.includes('useLocation()')) {
        content = content.replace(/const location = useLocation\(\);?/g, 'const pathname = usePathname();');
        content = content.replace(/location\.pathname/g, 'pathname');
        modified = true;
      }

      // Also ensure 'use client' is prepended
      if (!content.startsWith('"use client";') && !content.startsWith("'use client';") && !fullPath.includes('localApi') && !fullPath.includes('supabase')) {
        content = '"use client";\n' + content;
        modified = true;
      }

      // Fix absolute import in AuthContext
      if (fullPath.includes('AuthContext')) {
          content = content.replace('from "/utils/supabase/info"', 'from "@/utils/supabase/info"');
          modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Migrated ${fullPath}`);
      }
    }
  }
}

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});
