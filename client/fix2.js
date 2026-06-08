const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk('./app', (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Calculate depth from file to root `client` dir
      // app/(main)/login/page.jsx -> splits by \ or /
      // on windows it's \
      const relativePath = path.relative(path.dirname(file), path.join(__dirname, 'src'));
      // relativePath from app/(main)/login to src is ../../../src
      // replace Windows backslashes with forward slashes for imports
      const srcPrefix = relativePath.replace(/\\/g, '/');

      // Fix CSS imports (we moved them to src/styles)
      content = content.replace(/import ['"]\.\/([^'"]+\.css)['"]/g, `import '${srcPrefix}/styles/$1'`);
      content = content.replace(/import ['"]\.\.\/\.\.\/src\/pages\/([^'"]+\.css)['"]/g, `import '${srcPrefix}/styles/$1'`);
      content = content.replace(/import ['"]\.\.\/([^'"]+\.css)['"]/g, `import '${srcPrefix}/styles/$1'`);

      // Fix components imports
      content = content.replace(/import ([a-zA-Z0-9_{},\s]+) from ['"]\.\.\/components\/([^'"]+)['"]/g, `import $1 from '${srcPrefix}/components/$2'`);
      
      // Fix assets imports
      content = content.replace(/import ([a-zA-Z0-9_{},\s]+) from ['"]\.\.\/assets\/([^'"]+)['"]/g, `import $1 from '${srcPrefix}/assets/$2'`);
      
      fs.writeFileSync(file, content);
    }
  });
});
