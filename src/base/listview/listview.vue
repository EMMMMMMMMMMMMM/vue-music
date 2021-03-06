<template>
  <scroll :data="data" :listenScroll="listenScroll" @scroll="scroll" :probeType="probeType"  ref="listview" class="listview">
    <ul>
      <li :key="index" v-for="(group,index) in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="singerDetail(item)" :key="itemIndex" v-for="(item,itemIndex) in group.items" class="list-group-item">
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 手指移动的时候 快速切换 -->
    <div class="list-shortcut"
         @touchstart.stop.prevent="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li :class="{current: currentIndex === index}" :key="index" v-for="(item,index) in shortcutList" class="item" :data-index="index">{{item}}
        </li>
      </ul>
    </div>
    <!-- 滚动固定标题 -->
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  // 组件
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'

  // 锚点的高度
  const ANCHOR_HEIGHT = 18
  // 标题的高度 fiedx
  const TITLE_HEIGHT = 30

  // 方法
  import {getData} from 'common/js/dom'

  export default{
    props: {
      data: {
        type: Array,
        default: null
      }
    },
    computed: {
      // 右侧快速入口数组遍历
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      // 固定图标
      fixedTitle() {
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    created() {
      this.touch = {}
      this.listenScroll = true
      this.listHeight = []
      this.probeType = 3
    },
    data() {
        return {
            scrollY: -1,          //  快速入口锚点
            currentIndex: 0,
            diff: -1
        }
    },
    methods: {
        refresh() { // 调用子组件的 refresh
          this.$refs.listview.refresh()
        },
        onShortcutTouchStart(e) { // 轻点的时候
          let anchorIndex = getData(e.target, 'index')
          let firstTouch = e.touches[0]
          this.touch.y1 = firstTouch.pageY
          this.touch.anchorIndex = anchorIndex
          this._scrollTo(anchorIndex)
        },
        onShortcutTouchMove(e) { // 按住移动的时候
          let firstTouch = e.touches[0]
          this.touch.y2 = firstTouch.pageY
          //  偏移几个锚点
          let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0

          let anchorIndex = parseInt(this.touch.anchorIndex) + delta

          this._scrollTo(anchorIndex)
        },
        _scrollTo(index) { // 元素移动
          if (!index && index !== 0) {
            return
          }
          if (index <= 0) {
            index = 0
          } else if (index >= this.listHeight.length - 2) {
            index = this.listHeight.length - 2
          }
          this.scrollY = -this.listHeight[index]
          this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
        },
        //  获取scroll组件传过来的y值
        scroll(pos) {
          this.scrollY = pos.y
        },
        _calculateHeight() { // 每个区块对应的距离高度
          this.listHeight = []
          const list = this.$refs.listGroup
          let height = 0
          this.listHeight.push(height)
          for (let i = 0; i < list.length; i++) {
            let item = list[i]
            height += item.clientHeight
            this.listHeight.push(height)
          }
        },
        singerDetail(data) {
          this.$emit('Singerdetail', data)
        }
    },
    components: {
      Scroll,
      Loading
    },
    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      scrollY(newY) {
        const listHeight = this.listHeight
        // 当滚动到达顶部,newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        //  在中间部分滚动
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]         //  下限
          let height2 = listHeight[i + 1]     //  上限
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        var fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        //  上拉的时候不需要修改
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background

    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
