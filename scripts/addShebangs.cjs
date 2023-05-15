const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.resolve(__dirname, '../dist/cli.js'));
if (!data.includes('#!/usr/bin/env node')) {
  fs.writeFileSync(
    path.resolve(__dirname, '../dist/cli.js'),
    ['#!/usr/bin/env node', data].join('\n'),
  );
}
