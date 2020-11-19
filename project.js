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

  /**
  * @constructor
  */
  constructor() {
    this.project.main.block('event.whenflagclicked');
  }

  #variables(arr) {
    for (const variable of arr) {
      if (this.symbols.has(variable.symbol)) throw new Error(`Symbol: ${variable.symbol} already defined`);
      this.symbols.set(variable.symbol, this.project.main.variable(variable.name));
    }
  }

  #assets(arr) {
    for (const asset of arr) {
      this.project.sprite.asset(asset.file, asset.name);
    }
  }

  #procedures(arr) {
    for (const procedure of arr) {
      if (this.symbols.has(procedure.symbol)) throw new Error(`Symbol: ${procedure.symbol} already defined`);
      const def = this.project.main.procedure(procedure.name, procedure.attr.warp? procedure.attr.warp.trim()==='true':false);
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
      const ctx = proc.branch;
      for (const block of procedure.blocks) {
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
      data += `[procedure ${procedure.symbol}]: {\n`
      for (const block of procedure.blocks) {
        data += '\t' + this.#render_block(block, 1) + '\n';
      }
      data += '}\n\n';
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
    for (const file of this.files) {
      data += `#file ${file.filename}:\n`;
      data += this.#render_procedures(file.data.procedures);
      data += this.#render(file.data.blocks);
    }
    return data;
  }

  /**
  * write an sb3 file
  * @param {string} file path to write to
  */
  export(file) {
    this.project.export(file)
  }
}

module.exports = Project
