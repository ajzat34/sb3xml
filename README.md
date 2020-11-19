# sb3xml
Convert XML documents to SB3 projects

# Usage
```node
const fs = require('fs');
const Project = require('sb3xml');

const translationUnit = new Project();
translationUnit.file(fs.readFileSync('main.xml'), 'Main');
translationUnit.export(__dirname + 'out.sb3');
```
