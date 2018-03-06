<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" ref="bgImg" :style="setBgImg">
      <div class="play-wrapper" ref="playWrapper" v-show="songs.length">
        <div class="play" @click="random">
          <i class="icon-play"></i>
          <p class="text">随机播放全部</p>
        </div>
      </div>
      <div class="filter" ref="filter">
      </div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :rank="rank" @select="selectItem" :songs="songs"></song-list>
      </div>
       <div class="loading-container" v-show="!songs.length">
         <Loading></Loading>
       </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">

  // 引入组件
  import scroll from 'base/scroll/scroll'
  import songList from 'base/song-list/song-list'
  import Loading from 'base/loading/loading'

  // 属性
  const RESERVED_HEIGHT = 40
  const TRAN_FORM = prefixStyle('transform')
  const BACKDROP_FILTER = prefixStyle('backdrop-filter')

  // 方法
  import {prefixStyle} from 'common/js/dom'

  // vuex
  import {mapActions} from 'vuex'

  // mixin -> function
  import {playlistMixin} from 'common/js/mixin'

  export default{
    mixins: [playlistMixin],
    props: {
      bgImg: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: function () { return [] }
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    created() {
      this.listenScroll = true
      this.probeType = 3
    },
    components: {
      scroll,
      songList,
      Loading
    },
    mounted() {
      this.imageHeight = this.$refs.bgImg.clientHeight
      this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods: {
      scroll(val) {
        this.scrollY = val.y
      },
      back() {
        this.$router.back()
      },
      selectItem(item, index) {
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      random() { // 随机播放
        this.randomPlay({
          list: this.songs
        })
      },
      handlePlaylist() { // 出现迷你播放器的时候 显示不完整补救
        if (this.playlist.length === 0) return

        const bottom = `60px`
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    computed: {
      setBgImg() {
        return `background-image:url(${this.bgImg})`
      }
    },
    watch: {
      scrollY(newY) {
        let lateY = Math.max(this.minTranslateY, newY)
        let zIndex = 0
        let scale = 1
        this.$refs.layer.style[TRAN_FORM] = `translate3d(0,${lateY}px,0)`

        const percent = Math.abs(newY / this.imageHeight)

        if (newY > 0) {
          scale += percent
          zIndex = 10
        } else {
          var blur = Math.min(20 * percent, 20)
          this.$refs.filter.style[BACKDROP_FILTER] = `blur(${blur})`
        }

        if (newY < this.minTranslateY) {
          zIndex = 10
          this.$refs.bgImg.style.paddingTop = '0'
          this.$refs.bgImg.style.height = RESERVED_HEIGHT + 'px'
          this.$refs.playWrapper.style.display = 'none'
        } else {
          this.$refs.bgImg.style.paddingTop = '70%'
          this.$refs.bgImg.style.height = 0 + 'px'
          this.$refs.playWrapper.style.display = 'block'
        }
        this.$refs.bgImg.style.zIndex = zIndex
        this.$refs.bgImg.style[TRAN_FORM] = `scale(${scale})`
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: $color-background
    .back
      position: absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0.3%
      left: 13%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          border-radius: 100px
          font-size: 0
          color:$color-theme
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        tranform: translateY(-50%)
</style>
