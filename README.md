# 手写简易版Vuex项目my-vuex3

项目描述：旨在通过手写实现一个简易版的Vuex，帮助深入理解Vuex的工作原理和内部实现机制。项目涵盖了Vuex的核心功能，包括状态管理、Getter、Mutation、Action以及模块化支持。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## 项目创建详情

## 使用vue.use 启用 vuex 插件
vue.use 是 vue 提供的安装插件 API。如果插件是一个对象，必须提供 install 方法；如果一个插件是一个函数，它被视为 install 方法。install 方法调用时，会将Vue作为参数传入。这个方法的死一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。

即需要导出 install 方法，同时导出一个类Store。

## Store
在Vuex中，Store是一个对象，它是一个容器，用于存储和管理状态（state），包含了以下几个主要部分：
- state：存储状态的数据，也就是全局要共享的数据
- getters：包含一些函数，用于对state进行计算操作。
- mutations：包含一些函数，用于改变state的值
- actions：包含一些函数，用于处理异步操作或者一些逻辑处理

**state**
首先，我们需要定义一个存储对象，用于保存应用程序的所有状态。我们可以创建一个名为Store的类，并在其中定义一个状态对象。我们还可以将state对象定义为响应式的，以便在状态更改时通知Vue更新视图。这可以通过使用Vue.observable方法来实现。



###                 