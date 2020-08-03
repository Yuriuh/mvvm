class Vuette {
  constructor(options) {
    this.$options = options || {}
    const data = this._data = this.$options.data

    Object.keys(data).forEach(key => {
      this._proxyData(key)
    })

    this._initComputed()
    observe(data, this)
    this.$compile = new Compile(options.el)
  }

  $watch(key, cb, options) {

  }

  _proxyData(key, setter, getter) {

  }

  _initComputed() {

  }
}