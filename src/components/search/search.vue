<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" ref="shortcutWrapper" v-show="!query">
      <scroll :refreshDelay="refreshDelay" ref='scroll' class="shortcut" :data="hotKeyList">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" class="item" :key="index" v-for="(item, index) in hotKey">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索</span>
              <span class="clear" @click="clearConfirmAllSearch">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list @selectItem="searchQuery" @clearItem="delSerchHistory" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div ref="searchResult" class="search-result" v-show="query">
      <suggest ref="suggest" @select="saveSearch" @listScroll="blurInput" :query="query"></suggest>
    </div>
    <confirm @confirm="clearSearchAll" ref="confirm" text="是否确定清空历史搜索记录" confirmBtnText="清空"></confirm>
    <router-view />
  </div>
</template>

<script type="text/ecmascript-6">
  // 组件
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import SearchList from 'base/search-list/search-list'
  import Confirm from 'base/confirm/confirm'
  import Scroll from 'base/scroll/scroll'

  // 请求资源
  import {getHotKey} from 'api/search'

  // 属性
  import {ERR_OK} from 'api/config'

  // vuex
  import {mapActions, mapGetters} from 'vuex'

  // mixin
  import {playlistMixin, searchMixin} from 'common/js/mixin'

  export default {
    mixins: [playlistMixin, searchMixin],
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Confirm,
      Scroll
    },
    computed: {
      ...mapGetters([
        'searchHistory'
      ]),
      hotKeyList() {
        return this.hotKey.concat(this.searchHistory)
      }
    },
    data() {
      return {
        hotKey: []
      }
    },
    created() {
      this._getHotKey()
    },
    methods: {
      _getHotKey() { // 请求热门关键字 | 歌曲 | 歌手
        getHotKey().then((res) => {
          if (ERR_OK === res.code) {
            this.hotKey = res.data.hotkey.splice(0, 10) // -> 选取10条数据作为热搜
          }
        })
      },
      clearItem(item) { // 子组件删除当前某一条历史记录
        this.delSerchHistory(item)
      },
      clearConfirmAllSearch() { // 显示删除所有历史记录 的对话框
        this.$refs.confirm.show()
      },
      searchQuery(val) {
        this.$refs.searchBox.setQuery(val)
        this.saveSearchHistory(val)
      },
      handlePlaylist(playlist) {
        if (!playlist.length) return

        const bottom = `60px`

        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.scroll.refresh()

        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()
      },
      ...mapActions([
        'clearSearchAll'
      ])
    },
    watch: {
      query(newQuery) { // 监听 输入的内容点击返回的时候  历史搜索和热搜都能滚动
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.scroll.refresh()
          }, 20)
        }
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>