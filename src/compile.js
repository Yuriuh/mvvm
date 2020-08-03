class Compile {
  constructor(el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el)
      ? el
      : document.querySelector(el)

    if (this.$el) {
      this.$fragment = this.nodeToFragment(this.$el)
      this.init()
      this.$el.appendChild(this.$fragment)
    }
  }

  nodeToFragment(el) {
    const fragment = document.createDocumentFragment()
    let child
    // 将原生节点拷贝到 fragment
    while(child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }

  init() {
    this.compileElement(this.$fragment)
  }

  compileElement(el) {
    const childNodes = el.childNodes
    Array.prototype.slice.call(childNodes).forEach(node => {
      const text = node.textContent
      const reg = /\{\{(.*)\}\}/
      if (this.isElementNode(node)) {
        this.compile(node)
      } else if (this.isTextNode(node) && reg.test(text)) {
        this.compileText(node, RegExp.$1.trim())
      }

      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  compile(node) {
    const nodeAttrs = node.attributes || []
    Array.prototype.slice.call(nodeAttrs).forEach(attr => {
      const attrName = attr.name
      if (this.isDirective(attrName)) {
        const exp = attr.value
        const dir = attrName.substring(2)
        if (this.isEventDirective(dir)) {
          compileUtil.eventHandler(node, this.$vm, exp, dir)
        } else {
          compileUtil[dir] && compileUtil[dir](node, this.$vm, exp)
        }
        node.removeAttribute(attrName)
      }
    })
  }

  compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp)
  }

  isDirective(attr) {
    return attr.indexOf('v-') === 0
  }

  isEventDirective(dir) {
    return dir.indexOf('on') === 0
  }

  isElementNode(node) {
    return node.nodeType === 1
  }

  isTextNode(node) {
    return node.nodeType === 3
  }
}

const compileUtil = Object.freeze({
  text(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },

  html(node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },

  model(node, vm, exp) {
    this.bind(node, vm, exp, 'model')

    let value = this._getVMVal(vm, exp)
    node.addEventListener('input', e => {
      let newValue = e.target.value
      if (value === newValue) return

      this._setVMVal(vm, exp, newValue)
      value = newValue
    })
  },

  class(node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },

  bind(node, vm, exp, dir) {
    const updaterFn = updater[`${dir}Updater`]

    updaterFn && updaterFn(node, this._getVMVal(vm, exp))

    new Watcher(vm, exp, (value, oldValue) => {
      updaterFn && updaterFn(node, value, oldValue)
    })
  },

  eventHandler(node, vm, exp, dir) {
    const eventType = dir.split(':')[1]
    const fn = vm.$options.methods && vm.$options.methods[exp]

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },

  _getVMVal(vm, exp) {
    let val = vm
    exp = exp.split('.')
    exp.forEach(key => {
      val = val[key]
    })
    return val
  },

  _setVMVal(vm, exp, value) {
    let val = vm
    exp = exp.split('.')
    exp.forEach((key, index) => {
      if (index < exp.length - 1) {
        val = val[key]
      } else {
        val[key] = value
      }
    })
  }
})

const updater = Object.freeze({
  textUpdater(node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },

  htmlUpdater(node, value) {
    node.innerHTML = typeof value === 'undefined' ? '' : value
  },

  classUpdater(node, value, oldValue) {
    let className = node.className
    className = className.replace(oldValue, '').replace(/\s$/, '')
    const space = className && String(value) ? ' ' : ''
    node.className = className + space + value
  },

  modelUpdater(node, value, oldValue) {
    node.value = typeof value === 'undefined' ? '' : value
  }
})