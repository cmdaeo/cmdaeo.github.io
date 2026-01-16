const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); 

const toolsDir = path.join(process.cwd(), 'tools');
const outputFile = path.join(process.cwd(), 'tools-manifest.json');

if (!fs.existsSync(toolsDir)) {
  fs.writeFileSync(outputFile, '[]');
  console.log('No tools directory found, created empty manifest.');
  process.exit(0);
}

const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'));
const tools = files.map(file => {
  const content = fs.readFileSync(path.join(toolsDir, file), 'utf8');
  const $ = cheerio.load(content);
  return {
    filename: file,
    url: `./tools/${file}`,
    title: $('title').text() || file,
    description: $('description').text() || 'No description provided.',
  };
});

fs.writeFileSync(outputFile, JSON.stringify(tools, null, 2));
console.log(`Manifest updated with ${tools.length} tools.`);
