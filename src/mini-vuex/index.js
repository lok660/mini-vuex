let _Vue = null

class Store {
  //  构造函数接收一个对象
  constructor(options) {
    //  解构并给默认值,避免没有传当前属性
    const {
      state = {},
      getters = {},
      mutations = {},
      actions = {}
    } = options

    //  将state变成响应式
    this.state = _Vue.observable(state)

    //  对getters属性处理
    //  getter是一个对象,对象中有一些方法,每个方法都需要接收state参数,并且最终都有返回值
    //  这些方法都是获取值,所以可以用Object.defineProperty将这些方法转换成get访问器

    //  1.定义一个this.getters让外部可以直接访问,然后初始化成一个没有原型对象的空对象
    this.getters = Object.create(null)

    //  2.遍历所有的getters的key,将对应的key注册到this.getter对象中,定义一个get属性,返回key所对应的getters中方法的执行结果,并传入state
    Object.keys(getters).forEach(key => {
      Object.defineProperty(this.getters, key, {
        get: () => getters[key](state)
      })
    })

    //  3.私有化mutations和actions
    this._mutations = mutations
    this._actions = actions
  }

  //  在commit方法中获取_mutations
  //  接收两个参数,方法名称type和调用方法参数payload
  commit (type, payload) {
    //  通过tyoe找到this._mutations的方法并调用,传入参数payload
    this._mutations[type](this.state, payload)
  }

  //  在dispaych方法中获取_actions
  dispatch (type, payload) {
    //  第一个参数是context,这里简单模拟传入this,里面就有我们需要的state和commit
    this._actions[type](this, payload)
  }
}

//  install接收一个参数,Vue构造函数,后面Store类中还要使用构造函数,所以全局定义一个_Vue
function install (Vue) {
  _Vue = Vue

  //  1.创建Vue实例传入的store对象注入vue原型上的$store,在所有组件中用this.$store都可以获取到vuex参数,从而共享状态
  //  2.这里我们获取不到Vue实例,所以通过befroeCreate来获取Vue实例,从而拿到选项中的store对象
  _Vue.mixin({
    beforeCreate () {
      //  this就是Vue的实例
      //  首选判断Vue实例的options是否用store,当创建根实例的时候,会把store注入到Vue实例上,如果是组件实例,并没有store选项就不需要做这件事情
      if (this.$options.store) {
        _Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default {
  Store,
  install
}