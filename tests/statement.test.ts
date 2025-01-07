import Sval from '../src'

describe('testing src/index.ts', () => {
  it('should for statement run normally', () => {
    const interpreter = new Sval()
    interpreter.run(`
      for (let i = 0; i < 5; i++) {
        let r = i
      }
    `)
  })

  it('should break statement in switch run normally', () => {
    const interpreter = new Sval()
    interpreter.run(`
      exports.a = 0
      while (exports.a < 10) {
        exports.a++
        switch (2) {
          case 2: break
        }
      }
    `)
    expect(interpreter.exports.a).toEqual(10)
  })

  it('should for-in statement run normally', () => {
    const interpreter = new Sval()
    interpreter.run(`
      exports.a = []
      for (const i in [1, 2, 3]) {
        exports.a.push(i)
      }
    `)
    expect(interpreter.exports.a).toEqual(['0', '1', '2'])
  })

  it('should for-of statement run normally', () => {
    const interpreter = new Sval()
    interpreter.run(`
      exports.a = []
      for (const i of [1, 2, 3]) {
        exports.a.push(i)
      }
    `)
    expect(interpreter.exports.a).toEqual([1, 2, 3])
  })

  it('should for-await-of statement run normally', done => {
    const interpreter = new Sval()
    interpreter.import({ getItem, expect, done })
    interpreter.run(`
      b()
      async function* a() {
        for (const i of [1, 2, 3]) {
          yield await getItem(i)
        }
      }
      async function b() {
        const res = []
        for await (const i of a()) {
          res.push(i)
        }
        expect(res).toEqual([1, 2, 3])
        done()
      }
    `)
    function getItem(n: any) {
      return new Promise(resolve => setTimeout(resolve, 5, n))
    }
  })

  it('should for-await-of with manual iterator run normally', done => {
    const interpreter = new Sval()
    interpreter.import({ expect, done })
    interpreter.run(`
      c()
      function makeIterator(array) {
        var nextIndex = 0
        return {
          next: function() {
            return nextIndex < array.length ?
              { value: array[nextIndex++], done: false } :
              { value: undefined, done: true }
          }
        }
      }

      async function c() {
        const res = []
        for await (const i of makeIterator([1,2,3,4])) {
          res.push(i)
        }
        expect(res).toEqual([1, 2, 3, 4])
        done()
      }
    `)
  })

  it('should support for-await-of with sync iterables', done => {
    const interpreter = new Sval()
    interpreter.import({ expect, done })
    interpreter.run(`
      (async function run() {
        const res = []
        for await (const i of 'xyz') {
          res.push(i)
        }

        for await (const i of ['a', 'b', 'c']) {
          res.push(i)
        }

        for await (const i of { 0: 1, 1: 2, 2: 3, length: 3 }) {
          res.push(i)
        }

        for await (const i of new Set([4, 5, 6])) {
          res.push(i)
        }

        expect(res).toEqual(['x', 'y', 'z', 'a', 'b', 'c', 1, 2, 3, 4, 5, 6])
        done()
      })()
    `)
  })

  it('should support for-await-of with sync iterator', done => {
    const interpreter = new Sval()
    interpreter.import({ expect, done })
    interpreter.run(`
      const iterable = {
        [Symbol.iterator]() {
          return {
            i: 0,
            next() {
              if (this.i < 3) {
                return ({ value: this.i++, done: false })
              }
      
              return ({ done: true })
            }
          }
        }
      }; // ';' should be kept
      (async function() {
        const res = []
        for await (let num of iterable) {
          res.push(num)
        }

        expect(res).toEqual([0, 1, 2])
        done()
      })()
    `)
  })

  it('should support for-await-of with async iterator', done => {
    const interpreter = new Sval()
    interpreter.import({ expect, done })
    interpreter.run(`
      const asyncIterable = {
        [Symbol.asyncIterator]() {
          return {
            i: 0,
            next() {
              if (this.i < 3) {
                return Promise.resolve({ value: this.i++, done: false })
              }
      
              return Promise.resolve({ done: true })
            }
          }
        }
      }; // ';' should be kept
      (async function() {
        const res = []
        for await (let num of asyncIterable) {
          res.push(num)
        }

        expect(res).toEqual([0, 1, 2])

        done()
      })()
    `)
  })

  it('should support for-await-of with async generator', done => {
    const interpreter = new Sval()
    interpreter.import({ expect, done })
    interpreter.run(`
      async function* asyncGenerator() {
        var i = 0
        while (i < 3) {
          yield i++
        }
      }
      
      (async function() {
        const res = []
        for await (let num of asyncGenerator()) {
          res.push(num)
        }

        expect(res).toEqual([0, 1, 2])
        done()
      })()
    `)
  })

  it('should try statement run normally', () => {
    const interpreter = new Sval({ ecmaVer: 10 })
    interpreter.run(`
      try {
        throw 1
      } catch (err) {
        exports.a = err
      }
      try {
        throw 1
      } catch {
        exports.b = 2
      }
      exports.c = c()
      function c() {
        try {
          return 1
        } catch {
          return 2
        } finally {
          return 3
        }
      }
      for (const i of [4, 5, 6]) {
        try {
          exports.d = i
          continue
        } finally {
          break
        }
      }
    `)
    expect(interpreter.exports.a).toBe(1)
    expect(interpreter.exports.b).toBe(2)
    expect(interpreter.exports.c).toBe(3)
    expect(interpreter.exports.d).toBe(4)
  })

  it('should with statement run normally', () => {
    const interpreter = new Sval({ ecmaVer: 10 })
    interpreter.run(`
      let x = 0
      const a = {
        get b() { return x },
        set b(v) { x = v }
      }
      with (a) {
        exports.a = b
        b++
        exports.b = b
        exports.c = x
      }
      try {
        exports.d = b
      } catch (err) {
        if (err instanceof ReferenceError) {
          exports.d = true
        }
      }
    `)
    expect(interpreter.exports.a).toBe(0)
    expect(interpreter.exports.b).toBe(1)
    expect(interpreter.exports.c).toBe(1)
    expect(interpreter.exports.d).toBeTruthy()
  })

  it('should labeled statement run normally', () => {
    const interpreter = new Sval({ ecmaVer: 10 })
    interpreter.run(`
      let x = 0
      a: while (true) {
        if (x) {
          x++
          break
        }
        do {
          b: for (;;) {
            x++
            for (const a of [0,1,2,3,4]) {
              break b
            }
          }
          x++
          continue a
        } while (true)
      }
      exports.a = x
    `)
    expect(interpreter.exports.a).toBe(3)
  })
})
