<template>
  <transition name="list-fade">
    <div>
        <div class="playlist" v-show="showFlag" @click="hide">
        <div class="list-wrapper" @click.stop>
          <!-- 列表头部 -->
          <div class="list-header">
            <h1 class="title">
              <i class="icon" @click="changeMode" :class="iconMode"></i>
              <span class="text">{{ModeText}}</span>
              <span class="clear" @click="confirmShow">
                <i class="icon-clear"></i>
              </span>
            </h1>
          </div>
          <!-- 列表中间 -->
          <scroll :refreshDelay="refreshDelay" ref="scroll" :data="sequenceList" class="list-content">
            <transition-group tag="ul" name="list">
              <li ref="listItem" class="item" :key="item.id" v-for="(item, index) in sequenceList" @click="selectItem(item, index)">
                <i class="current" :class="getCurrentIcon(item)"></i>
                <span class="text">{{item.name}}</span>
                <span class="like" @click.stop="toggleFavorite(item)">
                  <i :class="getFavoriteIcon(item)"></i>
                </span>
                <span class="delete" @click.stop="deleSong(item)">
                  <i class="icon-delete"></i>
                </span>
              </li>
            </transition-group>
          </scroll>
          <!-- 列表操作 -->
          <div class="list-operate">
            <div class="add" @click="addSong">
              <i class="icon-add"></i>
              <span class="text">添加歌曲到队列</span>
            </div>
          </div>
          <!-- 关闭按钮 -->
          <div class="list-close" @click="hide">
            <span>关闭</span>
          </div>
        </div>
      </div>
      <confirm @confirm="clearPlay" text="是否清空列表内的歌曲" ref="confirm"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  // vuex
  import {mapActions} from 'vuex'

  // 组件
  import Scroll from 'base/scroll/scroll'
  import Confirm from 'base/confirm/confirm'
  import AddSong from 'components/add-song/add-song'

  // 属性
  import {playMode} from 'common/js/config'

  // 共享方法 mixin
  import {playerMixin} from 'common/js/mixin'

  export default{
    mixins: [playerMixin],
    data() {
      return {
        showFlag: false,
        refreshDelay: 120
      }
    },
    computed: {
      ModeText() {
        return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
      }
    },
    methods: {
      show() {
        this.showFlag = true
        setTimeout(() => {
          this.$refs.scroll.refresh()
          this.scrolllToCurrent(this.currentSong)
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      getCurrentIcon(item) { // 播放状态的图标
        if (item.id === this.currentSong.id) {
          return 'icon-play'
        } else {
          return ''
        }
      },
      selectItem(item, index) {
        if (playMode.random === this.mode) { // 如果是随机播放的话
          this.playlist.findIndex((song) => {
            return song.id === item.id
          })
        }

        this.setCurrentIndex(index)
        this.setPlayingState(true)
      },
      scrolllToCurrent(current) { // 跳到当前歌曲在列表的显示
        const index = this.sequenceList.findIndex((song) => {
          return song.id === current.id
        })

        this.$refs.scroll.scrollToElement(this.$refs.listItem[index], 300)
      },
      deleSong(item) { // 删除在列表的歌曲
        this.deleteSong(item)

        if (!this.playlist.length) {
          this.hide()
        }
      },
      confirmShow() { // 显示清理所有歌曲对话框
        this.$refs.confirm.show()
      },
      clearPlay() { // 清空列表内的歌曲
        this.hide()
        this.clearPlayList()
      },
      addSong() { // 添加歌曲
        this.$refs.addSong.show()
      },
      ...mapActions([
        'deleteSong',
        'clearPlayList'
      ])
    },
    watch: {
      currentSong(newVal, oldVal) {
        if (!newVal) {
          return
        }
        if (!this.showFlag || newVal.id === oldVal.id) { // 如果列表不展开的情况 和 新歌曲和旧歌区是同一首的话
          return
        }
        this.scrolllToCurrent(newVal)
      }
    },
    components: {
      Scroll,
      Confirm,
      AddSong
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
