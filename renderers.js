const boolean = require('./boolean');

module.exports = {

'SB3XML.internal.call': function(o) {
  const opcode = o.opcode;
  const block = o.block;
  return `${block.attr.symbol}()`
},

'SB3XML.internal.branch': function(o) {
  const opcode = o.opcode;
  const block = o.block;
  const args = o.evalParams(o.depth+1).map(d=>`${'\t'.repeat(o.depth+1)}${d}`).join('\n');
  return `{\n${args}\n${'\t'.repeat(o.depth)}}`;
},

'SB3XML.internal.string': function(o) {
  const value = o.block.attr.value;
  return `"${value}"`;
},

'SB3XML.internal.number': function(o) {
  const value = o.block.attr.value;
  return `${parseFloat(value)}`;
},

'SB3XML.internal.symbol': function(o) {
  const opcode = o.opcode;
  const block = o.block;
  return `${block.attr.symbol}`
},

'operator.mathop': function(o) {
  const ctx = o.ctx;
  const args = o.evalParams().join(', ');
  if (!(['abs','floor','ceiling','sqrt','sin','cos','tan','asin','acos','atan','ln','log','e^','10^'].includes(o.block.attr.op)))
    throw new Sb3XmlError(`value ${o.block.attr.op} for op in op is invalid`);
  return `operator.mathop.${o.block.attr.op}(${args})`
},

'operator.add': function(o) {
  const ctx = o.ctx;
  const args = o.evalParams()
  return `(${args[0]} + ${args[1]})`
},

'operator.subtract': function(o) {
  const ctx = o.ctx;
  const args = o.evalParams()
  return `(${args[0]} - ${args[1]})`
},

'operator.multiply': function(o) {
  const ctx = o.ctx;
  const args = o.evalParams()
  return `(${args[0]} * ${args[1]})`
},

'operator.divide': function(o) {
  const ctx = o.ctx;
  const args = o.evalParams()
  return `(${args[0]} / ${args[1]})`
},

'SB3XML.GENERIC': function(o) {
  const opcode = o.opcode;
  const block = o.block;
  const args = o.evalParams().join(', ');
  let open = ''
  let close = ''
  if (boolean.includes(opcode)) {
    open = '<';
    close = '>';
  }
  return `${open}${opcode}(${args})${close}`;
},

}
