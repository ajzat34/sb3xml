const xmldoc = require('xmldoc');

const options = {};

class Sb3XmlError extends Error {};

// parse a block
function parseBlock(node) {
  if (node.text) return false;
  return {
    block: node.name,
    children: node.children.map(parseBlock).filter(d=>d),
    attr: node.attr,
  }
}

// parse a proc
function parseProc(node) {
  const symbol = node.attr.symbol;
  if (!symbol) throw new Sb3XmlError(`Proc node must select a symbol`);
  const name = node.attr.name || symbol;
  return {
    symbol,
    name,
    blocks: node.children.map(parseBlock).filter(d=>d),
    attr: node.attr,
  };
}

// parse any node in the procedures node
function parseProcedure(node) {
  if (node.text) return false;
  const name = node.name.trim();
  if (name === 'proc') return parseProc(node);
  throw new Sb3XmlError(`Unknown procedures node ${node.name}`)
}

// parse the procedures node
function parseProcedures(node) {
  return {
    type: 'procedures',
    children: node.children.map(parseProcedure).filter(d=>d)
  }
}

function parseVar(type, node) {
  const symbol = node.attr.symbol;
  if (!symbol) throw new Sb3XmlError(`variable node must select a symbol`);
  const name = node.attr.name || symbol;
  return {
    type,
    symbol,
    name,
  }
}

// parse a var or list node
function parseVariable(node) {
  if (node.text) return false;
  const name = node.name.trim();
  if (name === 'var') return parseVar('var', node);
  if (name === 'list') return parseVar('list', node);
  throw new Sb3XmlError(`Unknown variables node ${node.name}`)
}

// parse the variables node
function parseVariables(node) {
  return {
    type: 'variables',
    children: node.children.map(parseVariable).filter(d=>d)
  }
}

// assets
  // parse an asset node
  function parseAsset(node) {
    if (node.text) return false;
    const name = node.name.trim();
    if (name === 'asset') {
      const symbol = node.attr.symbol;
      if (!symbol) throw new Sb3XmlError(`asset node must select a symbol`);
      const name = node.attr.name || symbol;
      const file = node.attr.file;
      if (!file) throw new Sb3XmlError(`asset node must select a file`);
      return {
        type: 'asset',
        symbol,
        name,
        file,
      }
    }
    throw new Sb3XmlError(`Unknown assets node ${node.name}`)
  }

  // parse the assets node
  function parseAssets(node) {
    return {
      type: 'assets',
      children: node.children.map(parseAsset).filter(d=>d)
    }
  }

function parseBlocks(node) {
  return {
    type: 'blocks',
    children: node.children.map(parseBlock).filter(d=>d),
  }
}

// parse top level nodes
function parseTopLevel(node) {
  if (node.text) return false;
  const name = node.name.trim();
  if (name === 'procedures') return parseProcedures(node);
  if (name === 'variables') return parseVariables(node);
  if (name === 'assets') return parseAssets(node);
  if (name === 'blocks') return parseBlocks(node);
  throw new Sb3XmlError(`Unknown top-level node ${node.name}`)
  return false;
}

// parse a document
function parseDoc(doc) {
  if (doc.doctype.trim() !== 'sb3xml') console.warn('document is not sb3xml');
  if (doc.name.trim() !== 'sb3') throw new Sb3XmlError(`Document must contain sb3 node`);
  return doc.children.map(parseTopLevel).filter(d=>d);
}

// main function
function parse(string) {
  const doc = new xmldoc.XmlDocument(string, options);
  const data = {
    variables: [],
    assets: [],
    procedures: [],
    blocks: [],
  };
  parseDoc(doc).forEach((item) => {
    if (!(item.type in data)) throw new Error(`${item.type} is invalid type`)
    data[item.type] = data[item.type].concat(item.children);
  });
  return data;
}

module.exports = parse;
