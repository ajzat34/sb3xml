module.exports = {
  // motion
  goto: 'motion.gotoxy',
  gotox: 'motion.setx',
  gotoy: 'motion.sety',
  x: 'motion.xposition',
  y: 'motion.yposition',
  direction: 'motion.direction',
  'set-angle': 'motion.pointindirection',

  // looks
  say: 'looks.say',
  think: 'looks.think',
  'set-costume': 'looks.switchcostumeto',
  costume: 'looks.costume',
  'set-size': 'looks.setsizeto',
  show: 'looks.show',
  hide: 'looks.hide',
  size: 'looks.size',

  // control
  sleep: 'control.wait',
  repeat: 'control.repeat',
  forever: 'control.forever',
  if: 'control.if',
  ifelse: 'control.if_else',
  'sleep-until': 'control.wait_until',
  until: 'control.repeat_until',

  // sensing
  ask: 'sensing.askandwait',
  answer: 'sensing.answer',
  keypressed: 'sensing.keypressed',
  keyoptions: 'sensing.keyoptions',
  mousedown: 'sensing.mousedown',
  mousex: 'sensing.mousex',
  mousey: 'sensing.mousey',
  timer: 'sensing.timer',
  'reset-timer': 'sensing.resettimer',

  // operator
  add: 'operator.add',
  sub: 'operator.subtract',
  mul: 'operator.multiply',
  div: 'operator.divide',
  mod: 'operator.mod',
  gt: 'operator.gt',
  lt: 'operator.lt',
  eq: 'operator.equals',
  and: 'operator.and',
  or: 'operator.or',
  not: 'operator.not',
  'str-join': 'operator.join',
  'str-index': 'operator.letter_of',
  'str-length': 'operator.length',
  'str-contains': 'operator.contains',
  random: 'operator.random',
  op: 'operator.mathop',

  // data
  set: 'data.setvariableto',
  incr: 'data.changevariableby',
  'var-show': 'data.showvariable',
  'var-hide': 'data.hidevariable',
  'list-push': 'data.addtolist',
  'list-remove': 'data.deleteoflist',
  'list-clear': 'data.deletealloflist',
  'list-insert': 'data.insertatlist',
  'list-replace': 'data.replaceitemoflist',
  'list-index': 'data.itemoflist',
  'list-find-index': 'data.itemnumoflist',
  'list-contains': 'data.listcontainsitem',
  'list-show': 'data.showlist',
  'list-hide': 'data.hidelist',
  'list-length': 'data.lengthoflist',

  // pen
  clear: 'pen.clear',
  stamp: 'pen.stamp',
  'pen-down': 'pen.penDown',
  'pen-up': 'pen.penUp',
  'pen-size': 'pen.setPenSizeTo',
  'pen-color': 'pen.setPenColorParamTo',

  // speical
  'stop-all': 'SB3XML.internal.stop.all',
  'stop-this': 'SB3XML.internal.stop.this',

  // internal
  string: 'SB3XML.internal.string',
  number: 'SB3XML.internal.number',
  s: 'SB3XML.internal.string',
  n: 'SB3XML.internal.number',
  var: 'SB3XML.internal.symbol',
  symbol: 'SB3XML.internal.symbol',
  call: 'SB3XML.internal.call',
  branch: 'SB3XML.internal.branch',
}
