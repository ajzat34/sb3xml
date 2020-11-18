const fs = require('fs');
const Project = require('./project');

const data = fs.readFileSync('./example.xml');
const translationUnit = new Project();
translationUnit.xml(data);
translationUnit.export(process.cwd() + '/out.sb3');
