# sb3xml
Convert XML documents to SB3 projects

# Usage
```node
const fs = require('fs');
const Project = require('sb3xml');

// create a program
const unit = new Project();

// load a file
unit.load(fs.readFileSync('main.xml'), 'Main');

// build the project
unit.build();

// export the sb3
unit.export(__dirname + 'out.sb3');

// print a representation of the program
console.log(unit.render());
```
