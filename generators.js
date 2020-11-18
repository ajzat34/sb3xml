function getSymbol(project, name) {
  if (!project.symbols.has(name)) throw new Error(`Symbol: ${name} is not defined`);
  return project.symbols.get(name);
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
    return parseFloat(value);
  } else {
    return value;
  }
},

'SB3XML.internal.branch': function(o) {
  const ctx = o.ctx;
  const branch = ctx.branch(_ctx=>o.evalParams(_ctx));
  return branch;
},

'control.if': function(o) {
  const nodes = o.evalParams(o.ctx);
  return o.ctx.block('control.if', nodes[1], nodes[0]);
},

'control.if_else': function(o) {
  const nodes = o.evalParams(o.ctx);
  return o.ctx.block('control.if_else', nodes[2], nodes[0], nodes[1]);
},

'SB3XML.internal.variable': function(o) {
  const block = o.block;
  const project = o.project;
  return getSymbol(project, block.attr.symbol);
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
