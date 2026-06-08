const fs = require('fs');
const path = require('path');

const cssFiles = ['Auth.css', 'CourseDetails.css', 'CourseLearning.css', 'LandingPage.css', 'LiveClass.css', 'Payment.css', 'UserDashboard.css'];

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
      const relativePath = path.relative(path.dirname(file), path.join(__dirname, 'src'));
      const srcPrefix = relativePath.replace(/\\/g, '/');

      cssFiles.forEach(css => {
        const regex = new RegExp(`import\\s+['"][^'"]*${css}['"]`, 'g');
        content = content.replace(regex, `import '${srcPrefix}/styles/${css}'`);
      });
      
      fs.writeFileSync(file, content);
    }
  });
});
