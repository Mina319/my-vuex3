let Vue = null

class Store {
    constructor(options){
        const { state = {}} =options
        // 使用 observable 响应化处理
        this.state = Vue.observable(state)
    }
}

function install(_Vue) {
    Vue = _Vue
    // 实现每一个组件，都能通过 this 调用 $store
    Vue.mixin({
        beforeCreate(){
            // 通过 this.$options 可以获取  new Vue({参数})传递的参数
            if (this.$options && this.$options.store) {
                // vue的原型上挂载 store （store 的实例）
                this.$store = this.$options.store
                // 等同于 Vue.prototype.$store = this.$options.store
            }
        }
    })
}

export default {
    Store,
    install
}
