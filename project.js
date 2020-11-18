const Sb3 = require('sb3');

const parse = require('./parse');
const alias = require('./alias');
const generators = require('./generators');

function resolve(name) {
  if (alias.hasOwnProperty(name)) return alias[name];
  else return name;
}

function uuid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

class Project {
  symbols = new Map();
  project = new Sb3();

  #variables(arr) {
    for (const variable of arr) {
      if (this.symbols.has(variable.symbol)) throw new Error(`Symbol: ${variable.symbol} already defined`);
      this.symbols.set(variable.symbol, this.project.main.variable(variable.name + '.' + uuid(16)));
    }
  }

  #assets(arr) {
    for (const asset of arr) {
      console.log('ignoring asset', asset);
    }
  }

  #procedures(arr) {
    for (const procedure of arr) {
      if (this.symbols.has(procedure.symbol)) throw new Error(`Symbol: ${procedure.symbol} already defined`);
      const def = this.project.main.procedure(procedure.name + '.' + uuid(16), procedure.attr.warp? procedure.attr.warp.trim()==='true':false);
      this.symbols.set(procedure.symbol, def);
    }
  }

  #block(data, ctx) {
    const self = this;

    const opcode = resolve(data.block);

    function createblock(data, ctx) {
      return self.#block(data,ctx);
    }

    function evalParams(_ctx=ctx) {
      return data.children.map(d=>createblock(d, _ctx))
    }

    const o = {
      block: data,
      children: data.children,
      opcode: opcode,
      project: this,
      symbols: this.symbols,
      createblock,
      evalParams,
      ctx,
    };

    if (generators.hasOwnProperty(opcode)) {
      return generators[opcode](o);
    } else {
      return generators['SB3XML.GENERIC'](o);
    }
  }

  #fill_procedures(arr) {
    for (const procedure of arr) {
      const proc = this.symbols.get(procedure.symbol);
      const ctx = proc.branch;
      for (const block of procedure.blocks) {
        this.#block(block, ctx);
      }
    }
  }

  #blocks(arr) {
    this.project.main.block('event.whenflagclicked');
    for (const block of arr) {
      this.#block(block, this.project.main);
    };
  }

  xml(xmlstring) {
    const data = parse(xmlstring);
    // console.log(data);
    this.#variables(data.variables);
    this.#assets(data.assets);
    this.#procedures(data.procedures);
    this.#fill_procedures(data.procedures);
    this.#blocks(data.blocks);

    console.log(this.symbols)
  }

  export(file) {
    this.project.export(file)
  }
}

module.exports = Project
