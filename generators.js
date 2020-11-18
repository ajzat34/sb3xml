const boolean = require('./boolean');
const assert = require('assert').strict;
const Sb3 = require('sb3');

function getSymbol(project, name) {
  if (!project.symbols.has(name)) throw new Error(`Symbol: ${name} is not defined`);
  return project.symbols.get(name);
}

function isBoolean(data) {
  return boolean.includes(data.template.fullname);
}

function assertBlock(data, opcode, name) {
  assert(data instanceof Sb3.Block, `${opcode}: "${name}" must be a block`);
}

function assertBranch(data, opcode, name) {
  assert(data instanceof Sb3.Branch, `${opcode}: "${name}" must be a branch`);
}

module.exports = {

'SB3XML.internal.call': function(o) {
  const ctx = o.ctx;
  const block = o.block;
  const project = o.project
  const proc = getSymbol(project, block.attr.symbol);
  return ctx.callProcedure(proc);
},

'SB3XML.internal.literal': function(o) {
  const value = o.block.attr.value;
  if (isNaN(value)) {
    return value;
  } else {
    return parseFloat(value);
  }
},

'SB3XML.internal.branch': function(o) {
  const ctx = o.ctx;
  const branch = ctx.branch(_ctx=>o.evalParams(_ctx));
  return branch;
},

'control.if': function(o) {
  const nodes = o.evalParams(o.ctx);
  assertBlock(nodes[0], 'if', 'condition');
  if (!isBoolean(nodes[0])) throw new Error('If statement condition is not a boolean');
  assertBranch(nodes[1], 'if', 'branch');
  return o.ctx.block('control.if', nodes[1], nodes[0]);
},

'control.if_else': function(o) {
  const nodes = o.evalParams(o.ctx);
  assertBlock(nodes[0], 'ifelse', 'condition');
  if (!isBoolean(nodes[0])) throw new Error('If statement condition is not a boolean');
  assertBranch(nodes[1], 'ifelse', 'branch:if');
  assertBranch(nodes[2], 'ifelse', 'branch:else');
  return o.ctx.block('control.if_else', nodes[1], nodes[2], nodes[0]);
},

'SB3XML.internal.variable': function(o) {
  const block = o.block;
  const project = o.project;
  return getSymbol(project, block.attr.symbol);
},

'control.repeat_until': function(o) {
  const nodes = o.evalParams(o.ctx);
  assertBlock(nodes[0], 'repeat_until', 'condition');
  if (!isBoolean(nodes[0])) throw new Error('repeat_until statement condition is not a boolean');
  assertBranch(nodes[1], 'repeat_until', 'branch');
  return o.ctx.block('control.repeat_until', nodes[1], nodes[0]);
},

'control.repeat': function(o) {
  const nodes = o.evalParams(o.ctx);
  assertBlock(nodes[0], 'repeat', 'times');
  assertBranch(nodes[1], 'repeat', 'branch');
  return o.ctx.block('control.repeat', nodes[1], nodes[0]);
},

'control.forever': function(o) {
  const nodes = o.evalParams(o.ctx);
  assertBranch(nodes[0], 'repeat', 'branch');
  return o.ctx.block('control.forever', nodes[0]);
},

'SB3XML.GENERIC': function(o) {
  const ctx = o.ctx;
  const opcode = o.opcode;
  const block = o.block;
  const project = o.project;
  const params = o.params;
  return ctx.block(opcode, ...o.evalParams());
},

}
