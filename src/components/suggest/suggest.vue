<template>
  <scroll class="suggest" ref="suggest" :beforeScroll="beforeScroll" @beforeScroll="listScroll" :data="result" :pullup="pullup" @scrollToEnd="searchMove">
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" :key="index" v-for="(item, index) in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <Noresult title="暂无搜索结果 | 换个试试?"></Noresult>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  // 请求资源
  import {search} from 'api/search'

  // 属性
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import Singer from 'common/js/singer'

  // 组件
  import Scroll from 'base/scroll/scroll'
  import Noresult from 'base/no-result/no-result'
  import Loading from 'base/loading/loading'

  // vuex
  import {mapMutations, mapActions} from 'vuex'

  const TYPE_SINGER = 'singer'
  const perpage = 20

  export default{
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        page: 1,
        result: [],
        pullup: true,
        hasMore: true,
        beforeScroll: true,
        refreshDelay: 120
      }
    },
    methods: {
      search() { // 请求搜索的资源
        this.$refs.suggest.scrollTo(0, 0)
        this.hasMore = true
        this.page = 1
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
            this.checkMove(res.data)
          }
        })
      },
      getIconCls(item) { // 样式
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      _genResult(data) { // 筛选 有数据的
        let ret = []
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) {
          ret = ret.concat(this._normalizeSong(data.song.list))
        }
        return ret
      },
      getDisplayName(item) { // 显示 歌手 | 歌曲 - 歌手
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      _normalizeSong(list) { // 转换
        let res = []
        list.forEach(item => {
          if (item.songid && item.albumid) {
            res.push(createSong(item))
          }
        })
        return res
      },
      searchMove() { // 接近底部当前请求数据的底部的时候
        if (!this.hasMore) {
          return
        }
        this.page ++
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this.result.concat(this._genResult(res.data)) // 旧数据和新数据做拼接
            this.checkMove(res.data)
          }
        })
      },
      checkMove(data) { // 如果搜索页面划到底
        const song = data.song

        if (!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
          this.hasMore = false
        }
      },
      selectItem(item) { // 点击了搜索页面歌手 | 歌曲
        if (item.type === TYPE_SINGER) { // 如果点击的是歌手的话 跳到歌手的页面
          let singer = new Singer({
            id: item.singermid,
            name: item.singername
          })

          this.setSinger(singer)
          this.$router.push({
            path: `/search/${item.singerid}`
          })
        } else {
          this.insertSong(item)
        }
        this.$emit('select')
      },
      listScroll() {
        this.$emit('listScroll')
      },
      refresh() {
        this.$refs.suggest.refresh()
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      query() {
        this.search()
      }
    },
    components: {
      Scroll,
      Loading,
      Noresult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
