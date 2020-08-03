class Vuette {
  constructor(options) {
    this.$options = options || {}
    const data = this._data = this.$options.data

    Object.keys(data).forEach(key => {
      this._proxyData(key)
    })

    this._initComputed()
    observe(data, this)
    this.$compile = new Compile(options.el || document.body, this)
  }

  $watch(key, cb, options) {
    new Watcher(this, key, cb)
  }

  _proxyData(key) {
    Object.defineProperty(this, key, {
      configurable: false,
      enumerable: true,
      get() {
        return this._data[key]
      },
      set(newVal) {
        this._data[key] = newVal
      }
    })
  }

  _initComputed() {
    const computed = this.$options.computed
    if (typeof computed === 'object') {
      Object.keys(computed).forEach(key => {
        Object.defineProperty(this, key, {
          get: (
            typeof computed[key] === 'function'
              ? computed[key]
              : computed[key].get
          ),
          set() {}
        })
      })
    }
  }
}