const Sb3 = require('sb3');

const Sb3XmlError = require('./error');

const parse = require('./parse');
const alias = require('./alias');
const generators = require('./generators');
const renderers = require('./renderers')

function resolve(name) {
  if (alias.hasOwnProperty(name)) return alias[name];
  else return name;
}

/**
* Main class
*/
class Project {
  symbols = new Map();
  project = new Sb3();
  files = [];

  var = [];
  list = [];
  asset = [];

  /**
  * @constructor
  */
  constructor() {
    this.project.main.block('event.whenflagclicked');
  }

  #variables(arr) {
    for (const variable of arr) {
      if (this.symbols.has(variable.symbol)) throw new Error(`symbol ${variable.symbol} already defined`);
      if (variable.type === 'var') {
        this.symbols.set(variable.symbol, this.project.main.variable(variable.name));
        this.var.push(variable.symbol);
      } else if (variable.type === 'list') {
        this.symbols.set(variable.symbol, this.project.main.list(variable.name));
        this.list.push(variable.symbol);
      }
      else throw new Error(`Unknown variable type ${variable.type}`);
    }
  }

  #assets(arr) {
    for (const asset of arr) {
      this.project.sprite.asset(asset.file, asset.name);
      this.asset.push(asset.name);
    }
  }

  #procedures(arr) {
    for (const procedure of arr) {
      if (this.symbols.has(procedure.symbol)) {
        if (!(this.symbols.get(procedure.symbol) instanceof Sb3.Branch.Procedure)) throw new Error(`symbol ${procedure.symbol} already defined as non-procedure`);
      } else {
        const def = this.project.main.procedure(procedure.name, procedure.attr.warp? procedure.attr.warp.trim()==='true':false);
        this.symbols.set(procedure.symbol, def);
      }
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

    try {
      if (generators.hasOwnProperty(opcode)) {
        return generators[opcode](o);
      } else {
        return generators['SB3XML.GENERIC'](o);
      }
    } catch (err) {
      err.line = data.line;
      throw err;
    }

  }

  #render_block(data, _depth=0) {
    const self = this;

    const opcode = resolve(data.block);

    function createblock(data, depth) {
      return self.#render_block(data, depth);
    }

    function evalParams(depth = _depth) {
      return data.children.map(d=>createblock(d, depth))
    }

    const o = {
      block: data,
      children: data.children,
      opcode: opcode,
      project: this,
      createblock,
      evalParams,
      depth: _depth,
    };

    try {
      if (renderers.hasOwnProperty(opcode)) {
        return renderers[opcode](o);
      } else {
        return renderers['SB3XML.GENERIC'](o);
      }
    } catch (err) {
      err.line = data.line;
      throw err;
    }
  }

  #fill_procedures(arr) {
    for (const procedure of arr) {
      const proc = this.symbols.get(procedure.symbol);
      if (proc.used) throw new Error(`Redefinition of procedure: ${procedure.symbol}`);
      const ctx = proc.branch;
      for (const block of procedure.blocks) {
        proc.done = true;
        this.#block(block, ctx);
      }
    }
  }

  #blocks(arr) {
    for (const block of arr) {
      this.#block(block, this.project.main);
    }
  }

  #render_procedures(arr) {
    let data = '';
    for (const procedure of arr) {
      const proc = this.symbols.get(procedure.symbol);
      data += `define ${procedure.symbol}()`
      if (procedure.blocks.length){
        data += ` {\n`
        for (const block of procedure.blocks) {
          data += '\t' + this.#render_block(block, 1) + '\n';
        }
        data += '}\n\n';
      } else data += '\n\n'
    }
    return data;
  }

  #render(arr) {
    let data = '';
    for (const block of arr) {
      data += this.#render_block(block, 0) + '\n';
    }
    return data;
  }

  /**
  * feed xml data into the project
  * @param {string} xmlstring
  * @param {string | undefined} filename defaults to XMLString
  */
  load(xmlstring, filename = 'XMLString') {
    const data = parse(xmlstring);
    this.files.push({data,filename});
    // define symbols
    this.#variables(data.variables);
    this.#assets(data.assets);
    this.#procedures(data.procedures);
  }

  /**
  * genorate sb3 code
  */
  build() {
    for (const file of this.files) {
      try {
        this.#fill_procedures(file.data.procedures);
        this.#blocks(file.data.blocks);
      } catch (err) {
        err.file = file.filename;
        throw err;
      }
    }
  }

  render() {
    let data = '';
    for (const v of this.var) data += `var ${v}\n`;
    for (const v of this.list) data += `list ${v}\n`;
    for (const v of this.asset) data += `asset ${v}\n`;
    for (const file of this.files) {
      data += `\n#file ${file.filename}:\n`;
      data += this.#render_procedures(file.data.procedures);
      data += this.#render(file.data.blocks);
    }
    return data.trim();
  }

  /**
  * write an sb3 file
  * @param {string} file path to write to
  * @return {promise}
  */
  export(file) {
    return this.project.export(file)
  }
}

module.exports = Project
