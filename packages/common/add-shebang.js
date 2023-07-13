const fs = require('node:fs');

const addShebang = (filePath) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const newContent = `#!/usr/bin/env node\n${data}`;

    fs.writeFile(filePath, newContent, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`🪧 Shebang added to ${filePath}`);
    });
  });
};

const filePath = process.argv[2];

addShebang(filePath);
