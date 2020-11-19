const boolean = require('./boolean');
const assert = require('assert').strict;
const Sb3 = require('sb3');

const Sb3XmlError = require('./error');
class LinkerError extends Sb3XmlError {};

function getSymbol(project, name) {
  if (!project.symbols.has(name)) throw new LinkerError(`symbol: ${name} is not defined`);
  return project.symbols.get(name);
}

function isBoolean(data) {
  return boolean.includes(data.template.fullname);
}

function assertBlock(data, opcode, name) {
  assert(data instanceof Sb3.Block, `malformed ${opcode}: "${name}" must be a block`);
}

function assertBranch(data, opcode, name) {
  assert(data instanceof Sb3.Branch, `malformed ${opcode}: "${name}" must be a branch`);
}

function assertProcedure(data, opcode, name) {
  assert(data instanceof Sb3.Branch.Procedure, `malformed ${opcode}: "${name}" must be a procedure`);
}

module.exports = {

'SB3XML.internal.call': function(o) {
  const ctx = o.ctx;
  const block = o.block;
  const project = o.project
  const proc = getSymbol(project, block.attr.symbol);
  assertProcedure(proc, 'call', 'symbol');
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

'SB3XML.internal.string': function(o) {
  const value = o.block.attr.value;
  return value;
},

'SB3XML.internal.number': function(o) {
  const value = o.block.attr.value;
  return parseFloat(value);
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
  return o.ctx.block('control.if_else', nodes[1], nodes[0], nodes[2]);
},

'SB3XML.internal.variable': function(o) {
  const block = o.block;
  const project = o.project;
  return getSymbol(project, block.attr.symbol);
},

'control.repeat_until': function(o) {
  const nodes = o.evalParams(o.ctx);
  assertBlock(nodes[0], 'repeat_until', 'condition');
  if (!isBoolean(nodes[0])) throw new Sb3XmlError('repeat_until statement condition is not a boolean');
  assertBranch(nodes[1], 'repeat_until', 'branch');
  return o.ctx.block('control.repeat_until', nodes[1], nodes[0]);
},

'control.repeat': function(o) {
  const nodes = o.evalParams(o.ctx);
  assertBranch(nodes[1], 'repeat', 'branch');
  return o.ctx.block('control.repeat', nodes[0], nodes[1]);
},

'control.forever': function(o) {
  const nodes = o.evalParams(o.ctx);
  assertBranch(nodes[0], 'repeat', 'branch');
  return o.ctx.block('control.forever', nodes[0]);
},

'SB3XML.internal.stop.all': function(o) {
  const ctx = o.ctx;
  const block = ctx.blocks.get('control.stop').instance('all', 'mutation', [], 'false');
  return ctx.push(block);
},

'operator.mathop': function(o) {
  const ctx = o.ctx;
  const nodes = o.evalParams();
  if (!(['abs','floor','ceiling','sqrt','sin','cos','tan','asin','acos','atan','ln','log','e^','10^'].includes(o.block.attr.op)))
    throw new Sb3XmlError(`value ${o.block.attr.op} for op in op is invalid`);
  return ctx.block('operator.mathop', o.block.attr.op, nodes[0]);
},

'SB3XML.GENERIC': function(o) {
  const ctx = o.ctx;
  const opcode = o.opcode;
  const block = o.block;
  const project = o.project;
  const params = o.params;
  return ctx.block(opcode, ...o.evalParams());
},

'SB3XML.internal.debug': function(o) {
  return {};
}

}
