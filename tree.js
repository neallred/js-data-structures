const leaf = Symbol('leaf');

// cmp should return -1, 0, or 1
class Tree {
  constructor(m, cmp, jsonify) {
    if (m === leaf) {
      throw new Error('leaf not allowed as a node value');
    }
    if (typeof cmp !== 'function') {
      throw new Error('cmp must be a function');
    }
    if (cmp instanceof Tree) {
      throw new Error('Tree class is not a valid comparator');
    }
    if (cmp(m,m) !== 0) {
      throw new Error('cmp(value, value) must return 0 (for equals)');
    }

    if (typeof jsonify !== 'function') {
      throw new Error('must pass a jsonify function');
    }

    this.l = leaf;
    this.m = m;
    this.r = leaf;
    this.cmp = cmp;
    this.jsonify = jsonify;
  };

  remove(toRemove) {
    let removedNode = leaf;
    const isFunction = typeof toRemove === 'function' && !(toRemove instanceof Tree);
    if (isFunction ? toRemove(this.l) : this.l === toRemove) {
      removedNode  = this.l;
      this.l = leaf;
    } else if (isFunction ? toRemove(this.r) : this.r === toRemove) {
      removedNode  = this.r;
      this.r = leaf;
    }

    return removedNode;
  }

  insert(v) {
    const comparison = this.cmp(this.m, v);
    if (comparison === -1) {
      if (this.l === leaf) {
        this.l = new Tree(v, this.cmp, this.jsonify);
      } else {
        this.l.insert(v);
      }
    } else if (comparison === 1) {
      if (this.r === leaf) {
        this.r = new Tree(v, this.cmp, this.jsonify);
      } else {
        this.r.insert(v);
      }
    } else if (comparison === 0) {
      // We can't guarantee that values being passed in are equal in all respects, so do assign.
      const returnValue = this.m;
      this.m = v;
      // And return the bumped out value.
      return returnValue
    } else {
      throw new Error(`Comparison is supposed to be one of -1, 0, 1, but was ${comparison}`);
    }
    return leaf
  }

  find(f) {
    const isFunction = typeof f === 'function' && !(f instanceof Tree);
    if (isFunction ? f(this.m) : this.m === f) {
      return this.m;
    }

    const lSearch = this.l.find(f);
    if (lSearch) {
      return lSearch
    }

    const rSearch = this.r.find(f);
    if (rSearch) {
      return rSearch;
    }

    return leaf;
  }

  isEqual(tree) {
    return (
      this.cmp(this.m, tree.m) === 0 &&
      (this.l === leaf ? tree.l === leaf : this.l.cmp(tree.l) === 0) &&
      (this.r === leaf ? tree.r === leaf : this.r.cmp(tree.r) === 0)
    );
  }

  static parseJSON(obj, cmp, jsonify, lKey = 'l', mKey = 'm', rKey = 'r', path = []) {
    const l = obj[lKey];
    const m = obj[mKey];
    const r = obj[rKey];

    if (m === null || m === undefined) {
      throw new Error(`"${m}" not allowed as middle value, as it is interpreted as "leaf". At path [${path.concat(mKey).join(', ')}]`);
    } 

    var parent = new Tree(m, cmp, jsonify);
    if (l === null || l === undefined) {
      parent.l = leaf;
    } else {
      parent.l = Tree.parseJSON(l, cmp, jsonify, lKey, mKey, rKey, path.concat(lKey));
    }
    if (r === null || r === undefined) {
      parent.r = leaf;
    } else {
      parent.r = Tree.parseJSON(r, cmp, jsonify, lKey, mKey, rKey, path.concat(rKey));
    }

    return parent
  }

  toJSON(lKey = 'l', mKey = 'm', rKey = 'r') {
  }
}

module.exports = Tree;
