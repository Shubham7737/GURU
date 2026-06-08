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
    if (file.endsWith('page.jsx')) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Fix CSS imports
      content = content.replace(/import ['"]\.\.\/\.\.\/src\/pages\/([^'"]+\.css)['"]/g, "import './$1'");
      
      // Fix AuthContext imports
      // depth could be varying
      const depth = file.split('app')[1].split(path.sep).length - 2;
      const prefix = '../'.repeat(depth) + '../src/context/AuthContext';
      content = content.replace(/import \{ useAuth \} from ['"][^'"]+AuthContext['"]/g, `import { useAuth } from '${prefix}'`);
      
      fs.writeFileSync(file, content);
    }
  });
});
