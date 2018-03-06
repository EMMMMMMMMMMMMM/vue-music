<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal" @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
       <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart.prevent="touchStart" @touchmove.prevent="touchMove" @touchend="touchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">
                {{playingLyric}}
              </div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" :class="{'current' : currentLineNum === index}" :key="index" class="text" v-for="(line,index) in currentLyric.lines">
                  {{line.txt}}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{active: currentShow === 'cd'}"></span>
            <span class="dot" :class="{active: currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{_formattingTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @percentChange="onProgressBarChange" :percent="percent"></progress-bar>
            </div>
            <span class="time time-r">{{_formattingTime(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" @click="_prev" :class="disableCls">
              <i class="icon-prev"></i>
            </div>
            <div class="icon i-center" @click="_togglePlaying" :class="disableCls">
              <i :class="playIcon"></i>
            </div>
            <div class="icon i-right" @click="_next" :class="disableCls">
              <i class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" @click.stop="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" @click="open" v-show="!fullScreen">
        <div class="icon">
          <img width="40" :class="cdCls" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="raduis" :percent="percent">
            <i @click.stop="_togglePlaying" class="icon-mini" :class="miniPlayIcon"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="playListShow">
          <i class="icon-playlist">
          </i>
        </div>
      </div>
    </transition>
    <play-list ref="playList"></play-list>
    <audio :src="currentSong.url" ref="audio" @play="_rady" @error="_error" @timeupdate="_Timeupdate" @ended="_ended"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  // 动画插件
  import animations from 'create-keyframe-animation'

  // vuex
  import {mapGetters, mapMutations, mapActions} from 'vuex'

  // 属性
  import {prefixStyle} from 'common/js/dom'
  import {playMode} from 'common/js/config'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')
  const DurationTime = 300 // -> 过渡时间

  // 歌词解析器
  import Lyric from 'lyric-parser'

  // 组件
  import progressBar from 'base/progress-bar/progress-bar' // -> 进度条
  import progressCircle from 'base/progress-circle/progress-circle' // -> 迷你状态下的进度
  import Scroll from 'base/scroll/scroll'
  import playList from 'components/playlist/playlist' // -> 歌曲列表

  // 共享方法  mixin
  import {playerMixin} from 'common/js/mixin'

  export default{
    mixins: [playerMixin],
    computed: {
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ]),
      playIcon() { // 暂停 | 播放 图标
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniPlayIcon() { // 迷你图标 -> 暂停 播放
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdCls() { // 封面旋转
        return this.playing ? 'play' : 'play pause'
      },
      disableCls() { // 资源没有请求缓过来的时候
        return this.songReady ? '' : 'disable'
      },
      percent() { // 歌曲进度
        return this.currentTime / this.currentSong.duration
      }
    },
    data() {
      return {
        songReady: false,
        currentTime: 0,
        raduis: 32, // -> 迷你状态 进度条 内圈的半径
        currentLyric: null,  // -> 歌词
        currentLineNum: 0, // -> 当前显示的歌词
        currentShow: 'cd', // -> 切换歌词 或者 cd 封面的状态
        playingLyric: null // 迷你歌词
      }
    },
    components: {
      progressBar,
      progressCircle,
      Scroll,
      playList
    },
    created() {
      this.touch = {}
    },
    methods: {
      back() { // 切换迷你效果
        this.setFullscreen(false)
      },
      open() { // 切换全屏
        this.setFullscreen(true)
      },
      //  动画效果
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }

        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })

        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      _getPosAndScale() {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerHeight / 2 - paddingLeft)
        const y = (window.innerHeight - paddingTop - width / 2 - paddingBottom)
        return {
          x,
          y,
          scale
        }
      },
      _togglePlaying() { // 暂停歌曲 | 播放歌曲
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      _prev() { // 上一首
        if (!this.songReady) { // 程序还没有缓过来
          return
        }
        if (this.playlist.length === 1) { // 只有一首歌的时候
          this._loop()
          return
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) { // 如果播放的图标没有切换的话
            this._togglePlaying()
          }
        }
      },
      _next() { // 下一首
        if (!this.songReady) { // 程序还没有缓过来
          return
        }
        if (this.playlist.length === 1) { // 只有一首歌的时候
          this._loop()
          return
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          if (!this.playing) { // 如果播放的图标没有切换的话
            this._togglePlaying()
          }
        }
      },
      _rady() { // 让资源加载完毕才让点击 下一首 | 上一首
        this.songReady = true
        this.savePlayHistory(this.currentSong)
      },
      _ended() { // 单曲循环 | 下一首
        if (this.mode === playMode.loop) { // -> 单曲循环状态
          this._loop()
        } else {
          // 循环状态 | 随机状态 -> 播放结束 下一首
          this._next()
        }
      },
      _loop() { // 循环播放
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      _error() { // 资源请求错误的时候  让用户可以自行再去点击
        this.songReady = true
      },
      _Timeupdate(ev) { // 歌曲的播放进度
        this.currentTime = ev.target.currentTime
      },
      _formattingTime(time) { // 格式化时间戳
        var timer = time | 0 // 向下取整
        var minute = timer / 60 | 0 // 分
        var second = timer % 60

        return `${this._pushZero(minute)}:${this._pushZero(second)}`
      },
      _pushZero(str, n = 2) { // 添加 数字 0
        var len = str.toString().length
        var num = ''
        while (len < n) {
          num += 0
          len++
        }
        return num + str
      },
      onProgressBarChange(newVal) { // 子组件调整歌曲进度
        const currentTime = this.currentSong.duration * newVal
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {
          this._togglePlaying()
        }
        this.currentLyric.seek(currentTime * 1000) // 跳到调整进度歌词的位置
      },
      // -> 请求歌词
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          if (this.currentSong.lyric !== lyric) return
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => { // -> 请求失败时候
          this.currentLyric = null
          this.currentLineNum = 0
          this.playingLyric = null
        })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000) // -> 调用子组件的函数  滑动
        }
        this.playingLyric = txt
      },
      // 封面 | 歌词  -> 左右划
      touchStart(e) { // 开始划
        this.touch.initate = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      touchMove(e) { // 按住划之前
        if (!this.touch.initate) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY

        if (Math.abs(deltaY) > Math.abs(deltaX)) { // 如果是按住往Y轴方向拖的划  不是我们考虑的范围
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, deltaX + left))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)

        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `0ms`
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = `0ms`
      },
      touchEnd(e) { // 划完之后
        let offsetWidth, opacity

        if (this.currentShow === 'cd') { // 从右向左滑动
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            this.currentShow = 'lyric'
            opacity = 0
          } else {
            opacity = 1
            offsetWidth = 0
          }
        } else { // 否则就是 从左向右
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            opacity = 0
            offsetWidth = -window.innerWidth
          }
        }
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${DurationTime}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${DurationTime}ms`
      },
      playListShow() { // 歌曲列表展示
        this.$refs.playList.show()
      },
      ...mapMutations({
        setFullscreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',
        setPlayList: 'SET_PLAYLIST'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      currentSong(NewVal, OldVal) {
        if (!NewVal) {
          return
        }
        if (NewVal.id === OldVal.id) {
          return
        }
        if (this.currentLyric) {
          this.currentLyric.stop()
        }
        clearTimeout(this.timer)
        this.timer = setTimeout(() => { // 载入页面自动播放  不用nextTick的原因是 微信后台到前台的操作 是有时间间隔的
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) { // 播放 |  暂停
        this.$nextTick(() => {
          newPlaying ? this.$refs.audio.play() : this.$refs.audio.pause()
        })
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position: absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0 auto
          padding: 10px 0px
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
            margin:0 5px
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
