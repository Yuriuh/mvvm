class Watcher {
  constructor(vm, expOrFn, cb) {
    this.cb = cb
    this.vm = vm
    this.expOrFn = expOrFn
    this.depIds = {}

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = this.parseGetter(expOrFn.trim())
    }
    this.value = this.get()
  }
  update() {
    this.run()
  }
  run() {
    const value = this.get()
    const oldValue = this.value
    if (value !== oldValue) {
      this.value = value
      this.cb.call(this.vm, value, oldValue)
    }
  }
  addDep(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this)
      this.depIds[dep.id] = dep
    }
  }
  get() {
    Dep.target = this
    const value = this.getter.call(this.vm, this.vm)
    Dep.target = null
    return value
  }
  parseGetter(exp) {
    if (/[^\w.$]/.test(exp)) return

    const exps = exp.split('.')

    return function(obj) {
      for (let i = 0; i < exps.length; i++) {
        if (!obj) return
        obj = obj[exps[i]]
      }
      return obj
    }
  }
}