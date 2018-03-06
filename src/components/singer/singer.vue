<template>
  <div class="singer" ref="singer">
    <list-view @Singerdetail="_SingerDetail" :data="singerList" ref="list"></list-view>
    <router-view />
  </div>
</template>

<script>
  // 配置参数
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'

  // 请求数据
  import {getSingerList} from 'api/singer'

  // 引入组件
  import listView from 'base/listview/listview.vue'

  // vuex
  import {mapMutations} from 'vuex'

  // 方法
  import {playlistMixin} from 'common/js/mixin'

  // 设置属性
  const HOT_SINGER_LEN = 10  // 火热歌手的数量
  const HOT_NAME = '热门歌手' // 标题

  export default{
    mixins: [playlistMixin],
    data() {
      return {
        singerList: []
      }
    },
    created() {
      this._getSingerList()
    },
    components: {
      listView
    },
    methods: {
      // 获取歌手的信息
      _getSingerList() {
        getSingerList().then(res => {
          if (res.code === ERR_OK) {
            this.singerList = this._normalizeSinger(res.data.list)
          }
        })
      },
      //  对返回过来的歌手信息数据进行处理
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({// 前10条数据放进->火热歌手
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
          }
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }))
        })

        // 为了得到有序列表，我们需要处理 map
        let ret = []      // 字母
        let hot = []      // 热门
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        // 排序
        ret.sort((a, b) => {
          // 两者的 字符集编码进行比较     charCodeAt 是返回字符集  字符串从0下标开始算
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      _SingerDetail(singer) { // 歌手详情页面跳转
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        //  vuex方法
        // this.$store.commit('SET_SINGER', singer)
        this.setSinger(singer)
      },
      handlePlaylist() { // 出现迷你播放器的时候 显示不完整补救
        if (this.playlist.length === 0) return
        const bottom = `60px`
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      ...mapMutations({ //  对象映射
        setSinger: 'SET_SINGER'
      })
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
