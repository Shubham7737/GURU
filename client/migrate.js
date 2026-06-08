const fs = require('fs');
const path = require('path');

const routes = {
  'Login.jsx': 'app/(main)/login/page.jsx',
  'Signup.jsx': 'app/(main)/signup/page.jsx',
  'CourseDetails.jsx': 'app/(main)/course/[id]/page.jsx',
  'Payment.jsx': 'app/(main)/payment/page.jsx',
  'UserDashboard.jsx': 'app/dashboard/page.jsx',
  'CourseLearning.jsx': 'app/(main)/learn/[courseId]/page.jsx',
  'LiveClass.jsx': 'app/(main)/live-session/[id]/page.jsx'
};

const srcPages = 'src/pages';

Object.keys(routes).forEach(file => {
  const srcPath = path.join(srcPages, file);
  const destPath = routes[file];
  
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Add "use client"
    if (!content.includes('"use client"')) {
      content = '"use client";\n\n' + content;
    }
    
    // Replace react-router-dom with next/navigation and next/link
    content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]react-router-dom['"]/g, (match, p1) => {
      let imports = [];
      let nextNav = [];
      if (p1.includes('Link')) imports.push("import Link from 'next/link';");
      if (p1.includes('useNavigate')) nextNav.push('useRouter');
      if (p1.includes('useParams')) nextNav.push('useParams');
      if (p1.includes('useLocation')) nextNav.push('usePathname');
      
      if (nextNav.length > 0) {
        imports.push(`import { ${nextNav.join(', ')} } from 'next/navigation';`);
      }
      return imports.join('\n');
    });
    
    content = content.replace(/const navigate = useNavigate\(\);/g, 'const router = useRouter();');
    content = content.replace(/navigate\(/g, 'router.push(');
    content = content.replace(/<Link\s+to=/g, '<Link href=');
    
    // Fix CSS imports (assuming they are in src/pages)
    content = content.replace(/import ['"]\.\/([^'"]+\.css)['"]/g, "import '../../src/pages/$1'");

    // Make sure destination dir exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.writeFileSync(destPath, content);
    console.log(`Migrated ${file} to ${destPath}`);
  }
});
