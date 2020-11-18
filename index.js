const fs = require('fs');
const Project = require('./project');

const data = fs.readFileSync('./example/example.xml');
const translationUnit = new Project();
translationUnit.xml(data);
translationUnit.export(__dirname + '/example/out.sb3');
