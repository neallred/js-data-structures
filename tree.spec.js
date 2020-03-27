const Tree = require('./tree');
const run = {
  suitesPassed: 0,
  suitesFailed: 0,
  suites: 0,
  testsPassed: 0,
  testsFailed: 0,
  tests: 0,
}
const failures = [];
let currentSuite = '';

function describe(label, f) {
  currentSuite = label;
  try {
    run.suites += 1;
    console.log(label);
    f();
  } catch (e) {
    failures.push({
      label: label,
      error: e,
    });
    run.suitesFailed += 1;
  }
  run.suitesPassed += 1;
};

function itThrows(label, f, errLabel = 'Expected to throw, but did not') {
  try {
    run.tests += 1;
    console.log(`    ${label}`);
    let threw;
    try {
      f();
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error(errLabel);
    }
  } catch (e) {
    failures.push({
      label: `${currentSuite} :: ${label}`,
      error: e,
    });
    run.testsFailed += 1;
    console.log('    ^FAIL^')
  }
  run.testsPassed += 1;
};

function it(label, f) {
  try {
    run.tests += 1;
    console.log(`    ${label}`);
    f();
  } catch (e) {
    failures.push({
      label: `${currentSuite} :: ${label}`,
      error: e,
    });
    run.testsFailed += 1;
    console.log('    ^FAIL^')
  }
  run.testsPassed += 1;
};

const id = x => x
const numCompare = (x,y) => x - y;

(function harness() {
  describe('parsing from JSON', () => {
    itThrows('disallows empty trees', () => {
      Tree.parseJSON({}, numCompare, id);
    });

    itThrows('requires a jsonify function', () => {
      Tree.parseJSON({m: 3}, numCompare, undefined);
    }, 'Expected jsonify function to be required, but it was not');

    itThrows('requires a compare function', () => {
      Tree.parseJSON({m: 3}, undefined, id);
    }, 'Expected compare function to be required, but it was not');

    it('Creates trees from valid inputs', () => {
      Tree.parseJSON({m: 3}, numCompare, id);
    });

    it('Creates trees from valid, nested inputs', () => {
      const treeObj = {
        l: {
          m: 890
        },
        m: 3,
        r: {
          l: {
            m: 321
          },
          m: 123,
          l: null,
        }
      }
      Tree.parseJSON(treeObj, numCompare, id);
    });
  });

  describe('isEqual', () => {
    it('reports that trees are equal when they are', () => {
      const makeJSONSimpleTree = () => ({ m: 3 });
      const a = Tree.parseJSON(makeJSONSimpleTree(), numCompare, id);
      const b = Tree.parseJSON(makeJSONSimpleTree(), numCompare, id);
      if (!a.isEqual(b)) {
        throw new Error('equal trees are not equal')
      };
    });
  });

  console.log('TEST RESULTS')
  console.log(JSON.stringify(run, null, 2));

  if (failures.length > 0) {
    failures.forEach(({label, error}) => {
      console.log(`${label}:`)
      console.log(error)
      console.log()
      process.exit(1);
    });
  }
})();
