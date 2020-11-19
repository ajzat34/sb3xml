const boolean = require('./boolean');

module.exports = {

'SB3XML.internal.call': function(o) {
  const opcode = o.opcode;
  const block = o.block;
  return `call ${block.attr.symbol}`
},

'SB3XML.internal.branch': function(o) {
  const opcode = o.opcode;
  const block = o.block;
  const args = o.evalParams(o.depth+1).map(d=>`${'\t'.repeat(o.depth+1)}${d}`).join('\n');
  return `{\n${args}\n${'\t'.repeat(o.depth)}}`;
},

'SB3XML.internal.literal': function(o) {
  const value = o.block.attr.value;
  if (isNaN(value)) {
    return `"${value}"`;
  } else {
    return `${parseFloat(value)}`;
  }
},

'SB3XML.internal.string': function(o) {
  const value = o.block.attr.value;
  return `"${value}"`;
},

'SB3XML.internal.number': function(o) {
  const value = o.block.attr.value;
  return `${parseFloat(value)}`;
},

'SB3XML.GENERIC': function(o) {
  const opcode = o.opcode;
  const block = o.block;
  const args = o.evalParams().join(' ');
  let open = ''
  let close = ''
  if (boolean.includes(opcode)) {
    open = '<';
    close = '>';
  }
  return `${open}${opcode}${args? ' '+args:''}${close}`;
},

}
