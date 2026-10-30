// Lays out two packages in a store the way Bun's isolated installs do, and links this
// project's node_modules/greeting into it:
//
//   <store>/node_modules/.store/greeting@1.0.0/node_modules/greeting         the package, which requires 'punctuation'
//   <store>/node_modules/.store/greeting@1.0.0/node_modules/punctuation      relative symlink -> ../../punctuation@1.0.0/node_modules/punctuation
//   <store>/node_modules/.store/punctuation@1.0.0/node_modules/punctuation   the package
//   ./node_modules/greeting                                                  junction -> the first
//
// Usage: node make-store.js <a new folder>
const fs = require('node:fs');
const path = require('node:path');

const storeArgument = process.argv[2];
if (storeArgument === undefined) {
  console.error('Usage: node make-store.js <a new folder, on another drive than this project>');
  process.exit(1);
}
const store = path.resolve(storeArgument);
const projectLink = path.join(__dirname, 'node_modules', 'greeting');
if (fs.existsSync(store) || fs.existsSync(projectLink)) {
  console.error(`${fs.existsSync(store) ? store : projectLink} exists already: pick a new store folder, and delete the node_modules/greeting link first`);
  process.exit(1);
}

const packages = path.join(store, 'node_modules', '.store');
const writePackage = (directory, name, source) => {
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'package.json'), `${JSON.stringify({ name, version: '1.0.0', main: 'index.js' }, null, 2)}\n`);
  fs.writeFileSync(path.join(directory, 'index.js'), source);
};

const greeting = path.join(packages, 'greeting@1.0.0', 'node_modules', 'greeting');
writePackage(greeting, 'greeting', "const punctuation = require('punctuation');\n\nmodule.exports = (name) => `Hello, ${name}${punctuation}`;\n");
writePackage(path.join(packages, 'punctuation@1.0.0', 'node_modules', 'punctuation'), 'punctuation', "module.exports = '!';\n");
fs.symlinkSync(
  path.join('..', '..', 'punctuation@1.0.0', 'node_modules', 'punctuation'),
  path.join(packages, 'greeting@1.0.0', 'node_modules', 'punctuation'),
  'dir',
);
fs.symlinkSync(greeting, projectLink, 'junction');

console.log(`project: ${__dirname}`);
console.log(`store:   ${store}`);
console.log(path.parse(__dirname).root === path.parse(store).root ? 'Both on the same drive.' : 'On different drives.');
