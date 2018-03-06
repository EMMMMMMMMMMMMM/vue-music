<template>
  <div class="progress-bar" ref="progressBar" @click="_progressBar">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn" @touchstart.prevent="_progressTouchStart" @touchmove.prevent="_progressTouchMove" @touchend="_progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16
  const transform = prefixStyle('transform')

  export default{
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      this.touch = {}
    },
    methods: {
      _progressTouchStart(e) { // 手指 按下
        this.touch.initiated = true
        this.touch.starX = e.touches[0].pageX
        this.touch.left = this.$refs.progress.clientWidth // -> 歌曲当前的进度
      },
      _progressTouchMove(e) { // 手指拖动
        if (!this.touch.initiated) {
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.starX
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))

        this._offset(offsetWidth) // 进度条移动
      },
      _progressTouchEnd(e) { // 手指离开
        this.touch.initiated = false
        this._triggerPercent()
      },
      _triggerPercent() { // 派发更改 进度条的数据
        const BarWidth = this.$refs.progressBar.clientWidth - progressBtnWidth // -> 总共能拖拽的范围
        const offsetWidth = this.$refs.progress.clientWidth / BarWidth // 拖拽的进度 / 总共能拖拽的范围

        this.$emit('percentChange', offsetWidth)
      },
      _offset(changeWidth) { // -> 进度条移动
        this.$refs.progress.style.width = `${changeWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${changeWidth}px,0,0)`
      },
      _progressBar(e) { // 点击 快进 歌曲进度
        this.$nextTick(() => {
          // 这里计算错误  点击 progressBtn 的时候计算出错
          // this._offset(e.offsetX)
          const rect = this.$refs.progressBar.getBoundingClientRect()
          const offsetWidth = e.pageX - rect.left
          this._offset(offsetWidth)
          this._triggerPercent()
        })
      }
    },
    watch: {
      percent(newPercent) { // 进度条
        if (newPercent >= 0 && !this.touch.initiated) {
          const BarWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          const offsetWidth = newPercent * BarWidth

          // 进度条移动
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
