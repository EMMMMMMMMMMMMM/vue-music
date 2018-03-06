<template>
  <div class="song-list">
    <ul>
      <li @click="selectItem(item,index)" :key="index" v-for="(item,index) in songs" class="item">
        <div class="rank" v-show="rank">
          <p :class="rankCls(index)">{{ranText(index)}}</p>
        </div>
        <div class="content">
          <h2 class="name">{{item.name}}</h2>
          <p class="desc">{{Strjoin(item)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  export default{
    props: {
      songs: {
        type: Array,
        default: function () { return [] }
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      Strjoin(str) {
        return `${str.singer} / ${str.album}`
      },
      selectItem(item, index) {
        this.$emit('select', item, index)
      },
      rankCls(index) {
        if (index < 3) {
          return `icon icon${index}`
        } else {
          return 'text'
        }
      },
      ranText(index) {
        if (index > 2) {
          return index + 1
        }
      }
    },
    created() {
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>
