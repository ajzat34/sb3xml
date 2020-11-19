const fs = require('fs');
const Project = require('./project');

const data = fs.readFileSync('./example/example.xml');
const unit = new Project();
unit.load(data);
unit.build();
console.log(unit.render());
unit.export(__dirname + '/example/out.sb3');
