<template>
  <div class="recommend" ref="recommend">
      <scroll ref="scroll" class="recommend-content" :data="recommendList">
        <div>
          <div v-if="recommends.length" class="slider-wrapper">
            <slider>
              <div :key="i" v-for="(item,i) in recommends">
                <a :href="item.linkUrl">
                  <img class="needclick" @load="_ImgLoad" :src="item.picUrl">
                </a>
              </div>
            </slider>
          </div>
          <div class="recommend-list">
            <h1 class="list-title">热门歌单推荐</h1>
            <ul>
              <li class="item" @click="Disc(item)" :key="index" v-for="(item,index) in recommendList">
                <div class="icon">
                  <img v-lazy="item.imgurl" width="60" height="60">
                </div>
                <div class="text">
                  <h2 class="name" v-html="item.creator.name"></h2>
                  <p class="desc" v-html="item.dissname"></p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="loading-container" v-show="!recommendList.length">
          <loading></loading>
        </div>
      </scroll>
      <router-view />
  </div>
</template>

<script type="text/ecmascript-6">
  // 请求的配置
  import {ERR_OK} from 'api/config'

  // 请求的数据
  import {getRecommend, getDiscList} from 'api/recommend'

  // 公共方法
  import {playlistMixin} from 'common/js/mixin'

  // 请求的组件
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'

  // vuex
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
        return {
            recommends: [], // 轮播图信息
            recommendList: [] // 音乐列表
        }
    },
    created() {
        this._getRemmend()
        this._getRemmendList()
    },
    mounted() {
        this.$refs.scroll.refresh()
    },
    components: {
        Slider,
        Scroll,
        Loading
    },
    methods: {
      Disc(data) { // 跳转到 推荐榜单
        this.$router.push({
          path: `/recommend/${data.dissid}`
        })
        this.setDisc(data)
      },
      handlePlaylist() { // 出现迷你播放器的时候 显示不完整补救
        if (this.playlist.length === 0) return
        const bottom = `60px`
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      _getRemmend() { // 轮播图
          getRecommend().then(res => {
              if (res.code === ERR_OK) {
                  this.recommends = res.data.slider
              }
          })
      },
      _getRemmendList() {
        getDiscList().then(res => { // 列表信息
              if (res.code === ERR_OK) {
                  this.recommendList = res.data.list
              }
          })
      },
      _ImgLoad() { // 防止 轮播图的数据加载缓慢 导致  better-scroll 插件计算失误 等待加载完毕  重新计算
        if (!this.loadImg) {
          this.loadImg = true
          this.$refs.scroll.refresh()
        }
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>