<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <!-- 头部 -->
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <!-- 搜索框 -->
      <div class="search-box-wrapper">
        <search-box ref="searchBox" @query="search" placeholder="搜索歌曲"></search-box>
      </div>
      <!-- 历史记录 -->
      <div class="shortcut" v-show="!query">
        <switches :currentIndex="currentIndex" :switches="switches" @switchItem="switchItem"></switches>
        <div class="list-wrapper">
          <scroll ref="songList" class="list-scroll" :data="playHistory" v-if="currentIndex === 0">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll :refreshDelay="refreshDelay" ref="searchList" :data="searchHistory" class="list-scroll" v-if="currentIndex === 1">
            <div class="list-inner">
              <search-list @selectItem="Query" @clearItem="delSerchHistory" :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <!-- 搜索结果 -->
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="setSuggest" @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">一首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  // 组件
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import Switches from 'base/switches/switches'
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import searchList from 'base/search-list/search-list'
  import TopTip from 'base/top-tip/top-tip'

  // 属性
  import Song from 'common/js/song'

  // mixin
  import {searchMixin} from 'common/js/mixin'

  // vuex
  import {mapGetters, mapActions} from 'vuex'

  export default{
    mixins: [searchMixin],
    data() {
      return {
        showFlag: false,
        showSinger: false,
        currentIndex: 0,
        switches: [
          {name: '最近播放'},
          {name: '搜索记录'}
        ]
      }
    },
    methods: {
      show() {
        this.showFlag = true
        setTimeout(() => {
          if (this.currentIndex === 0) {
            this.$refs.songList.refresh()
          } else {
            this.$refs.searchList.refresh()
          }
        })
      },
      hide() {
        this.showFlag = false
      },
      search(newQuery) {
        this.query = newQuery
      },
      setSuggest() { // 存储搜索记录
        this.saveSearch(this.query)
        this.showTip()
      },
      switchItem(index) {
        this.currentIndex = index
      },
      selectSong(song, index) {
        if (index !== 0) {
          this.insertSong(new Song(song))
          this.showTip()
        }
      },
      Query(newQuery) {
        this.addQuery(newQuery)
        this.currentIndex = 1
        this.show()
      },
      showTip() {
        this.$refs.topTip.show()
      },
      ...mapActions([
        'insertSong'
      ])
    },
    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },
    components: {
      SearchBox,
      Suggest,
      Switches,
      Scroll,
      SongList,
      searchList,
      TopTip
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
