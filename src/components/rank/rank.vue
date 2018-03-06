<template>
  <div class="rank" ref="rank">
    <scroll :data="topList" class="toplist" ref="scroll">
      <ul>
        <li class="item" @click="_selectItem(item)" :key="num" v-for="(item,num) in topList">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl">
          </div>
          <ul class="songlist">
            <li class="song" :key="index" v-for="(song, index) in item.songList">
              <span>{{index + 1}}</span>
              <span>{{song.songname}} - {{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
    </scroll>
    <div class="loading-container" v-show="!topList">
      <loading></loading>
    </div>
    <router-view/>
  </div>
</template>

<script type="text/ecmascript-6">
  // 共用方法
  import {playlistMixin} from 'common/js/mixin'

  // 基本属性
  import {ERR_OK} from 'api/config'

  // 请求资源文件
  import {getTopList} from 'api/rank'

  // 组件
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'

  // 请求属性
  import {mapGetters, mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    created() {
      this._getTopList()
    },
    data() {
      return {
        topList: []
      }
    },
    computed: {
      ...mapGetters([
        'playlist'
      ])
    },
    methods: {
      _selectItem(item) {
        this.$router.push({
          path: `/rank/${item.id}`
        })
        this.setTopList(item)
      },
      _getTopList() {
        getTopList().then((res) => {
          if (res.code === ERR_OK) {
            this.topList = res.data.topList
          }
        })
      },
      handlePlaylist() {
        if (this.playlist.length === 0) return

        const bottom = `60px`
        this.$refs.rank.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      ...mapMutations({
        setTopList: 'SET_TOP_LIST'
      })
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        margin: 0 20px
        padding-top: 20px
        height: 100px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .songlist
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          padding: 0 20px
          height: 100px
          overflow: hidden
          background: $color-highlight-background
          color: $color-text-d
          font-size: $font-size-small
          .song
            no-wrap()
            line-height: 26px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>