const fs = require('fs');
const Project = require('./project');

const data = fs.readFileSync('./test.xml');
const unit = new Project();
unit.load(data);
unit.build();
console.log(unit.render());
unit.export(__dirname + '/test.sb3');
