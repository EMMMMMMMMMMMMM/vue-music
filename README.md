>动图可能有点卡  截图软件截得卡卡的   见谅

![Image text](gif.gif)

### 发现推荐列表的api 被拒绝请求了 可以不要点击首页的推荐列表

>如果发生了点击无法跳转的情况 则是数据源请求失败  api更改

> 该项目功能上实现了歌手页面、歌手详情页、播放器内核、搜索页面等。项目采用的技术栈主要有Vue.js+vuex+vue-router+axios+路由懒加载等。

### 项目技术架构
***
*  vue-cli
*  vue
*  vuex
*  vue-router
*  axios
*  stylus
*  webpack
## Build Setup

###安装
***
项目地址：（`git clone`）
```shell
git@github.com:wkl007/vue-music.git
```
通过`npm`安装本地服务第三方依赖模块(需要已安装[Node.js](https://nodejs.org/))

```
npm install
```
启动服务(http://localhost:8080)

```
npm run dev
```

###目录结构
***
<pre>
├── build              // 构建服务和webpack配置
├── config             // 项目不同环境的配置
├── index.html         // 项目入口文件
├── package.json       // 项目配置文件
├── src                // 生产目录
│   ├── api            // 数据交互相关
│   ├── base           // 基础组件
│   ├── common         // 公共的css js 资源
│   ├── components     // 业务组件
│   ├── router         // 路由配置
│   ├── store          // vuex配置
│   ├── App.vue        // 主页面 
│   └── main.js        // Webpack 预编译入口
</pre>

###实现的功能
***
* 推荐页面
* 歌手页面
* 排行页面
* 搜索页面
* 播放器内核实现
* 个人歌曲管理
* 等等





