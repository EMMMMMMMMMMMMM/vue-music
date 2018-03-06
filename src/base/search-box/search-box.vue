<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input v-model="query" ref="Input" :placeholder="placeholder" class="box">
    <i v-show="query" class="icon-dismiss" @click="clear"></i>
  </div>
</template>

<script type="text/ecmascript-6">
  // 方法
  import {debounce} from 'common/js/dom'

  export default{
    props: {
      placeholder: {
        type: String,
        default: '请输入歌手 | 歌曲'
      }
    },
    data() {
      return {
        query: ''
      }
    },
    created() {
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery)
      }, 500))
    },
    methods: {
      clear() {
        this.query = ''
      },
      setQuery(newQuery) { // 父组件传递过来的热搜值
        this.query = newQuery
      },
      blur() {
        this.$refs.Input.blur()
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    height 40px
    padding: 0 6px
    background: $color-highlight-background
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
