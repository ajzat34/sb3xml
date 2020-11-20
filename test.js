const fs = require('fs');
const Project = require('./project');

const unit = new Project();
unit.load(fs.readFileSync('./test_a.xml'), 'test_a.xml');
unit.load(fs.readFileSync('./test_b.xml'), 'test_b.xml');
unit.build();
console.log(unit.render());
unit.export(__dirname + '/test.sb3');
