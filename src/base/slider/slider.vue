<!--  -->
<template>
  <div class="slider" ref="slider">
      <div class="slider-group" ref="sliderGroup">
            <!-- 外部内容填充时替换此处 -->
            <slot></slot>
      </div>
      <div class="dots">
          <span class="dot" :key="index" v-for="(item,index) in dots" :class="{active: index === currentPageIndex}"></span>
      </div>
  </div>
</template>

<script>
import {addClass} from 'common/js/dom'
import Bscroll from 'better-scroll'
export default {
    data() {
        return {
            dots: [],
            currentPageIndex: 0
        }
    },
    props: {
        loop: {
            type: Boolean,
            default: true
        },
        autoPlay: {
            type: Boolean,
            default: true
        },
        interval: {
            type: Number,
            default: 4000
        }
    },
    mounted: function() {
        // 等待页面加载完毕
        setTimeout(() => {
            this._setSliderWidth()
            this._dotsArr()
            this._doMove()

            if (this.autoPlay) {
                this._autoPlay()
            }
        }, 20)

        window.addEventListener('resize', () => {
            if (!this.slider) {
                return
            }
            this._setSliderWidth()
            this.slider.refresh()
        })
    },
    methods: {
        _setSliderWidth(isSize) {
            this.children = this.$refs.sliderGroup.children

            let width = 0
            let sliderWidth = this.$refs.slider.clientWidth

            for (let i = 0; i < this.children.length; i++) {
                // 添加样式
                let child = this.children[i]
                addClass(child, 'slider-item')

                child.style.width = sliderWidth + 'px'
                width += sliderWidth
            }
            // 只有第一次 页面发生挂载完毕状态之后 才会执行这个if 方法  window.size触发不会触发这个判断
            if (this.loop && !isSize) {
                width += 2 * sliderWidth
            }
            this.$refs.sliderGroup.style.width = width + 'px'
        },
        _doMove() {
            // Bscroll 插件的配置属性
            this.slider = new Bscroll(this.$refs.slider, {
                scrollX: true, // 横向滚动
                scrollY: false,
                momentum: false, // 惯性
                snap: true,
                snapLoop: this.loop, // 循环
                snapThreshold: 0.3, // 大于多少时触发滑动到下一张
                snapSpeed: 400 // 滑动完成的时间
                // click: true // 传递点击
            })

            this.slider.on('scrollEnd', () => {
                // 从1开始算起  但第一个是 0 如果是循环状态的话 就要减1
                let PageX = this.slider.getCurrentPage().pageX
                if (this.loop) {
                    PageX -= 1
                }
                this.currentPageIndex = PageX

                if (this.autoPlay) {
                    clearTimeout(this.timer)
                    this._autoPlay()
                }
            })
        },
        _dotsArr() {
            // 计算子元素
            this.dots = new Array(this.$refs.sliderGroup.children.length)
        },
        _autoPlay() {
            // 自动轮播
            var PageX = this.currentPageIndex + 1 // 第一次加1是因为  currentPageIndex 是从0开始算起的 +1 就相当于从1开始算起的位置
            if (this.loop) {
                PageX += 1 // 再次加 1 是因为下一张
            }
            this.timer = setTimeout(() => {
                this.slider.goToPage(PageX, 0, 400)
            }, this.interval)
        }
    },
    destroyed() {
        // 优化 当页面离开的时候
        clearTimeout(this.timer)
    }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
 @import "~common/stylus/variable"

.slider
    min-height: 1px
    .slider-group
        position: relative
        overflow: hidden
        white-space: nowrap
        .slider-item
            float: left
            box-sizing: border-box
            overflow: hidden
            text-align: center
            a
                display: block
                width: 100%
                overflow: hidden
                text-decoration: none
            img
                display: block
                width: 100%
    .dots
        position: absolute
        right: 0
        left: 0
        bottom: 12px
        text-align: center
        font-size: 0
        .dot
            display: inline-block
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
        .active
            width: 20px
            border-radius: 5px
            background: $color-theme
</style>
