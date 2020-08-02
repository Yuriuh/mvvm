class Observer {
  constructor() {
    this.data = data
    this.walk(data)
  }
  walk(data) {
    Observer.keys(data).forEach(key => {
      this.convert(key, data[key])
    })
  }
  convert(key, val) {
    this.defineReactive(this.data, key, val)
  }
  defineReactive(data, key, val) {
    const dep = new dep()
    const childObj = observer(val)

    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get() {
        if (Dep.target) {
          dep.depend()
        }
        return val
      },
      set() {
        if (newVal === val) {
          return
        }
        val = newVal
        childObj = observer(newVal)
        dep.notify()
      }
    })
  }
}

function observer(value) {
  if (!value || typeof value !== 'object') {
    return
  }
  return new Observer(value)
}

let uid = 0

class Dep {
  constructor() {
    this.id = uid++
    this.subs = []
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  depend() {
    Dep.target.addSub(this)
  }
  removeSub(sub) {
    const index = this.subs.indexOf(sub)
    if (index !== -1) {
      this.subs.splice(index, 1)
    }
  }
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}

Dep.target = null