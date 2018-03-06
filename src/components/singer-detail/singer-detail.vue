<template>
  <transition name="slide">
    <musicList :title="title" :bg-img="bgImg" :songs="songs"></musicList>
  </transition>
</template>

<script type="text/ecmascript-6">
  // 请求配置属性
  import {ERR_OK} from 'api/config.js'
  import {createSong} from 'common/js/song'

  // 请求歌手的歌曲数据
  import {getSingerDetail} from 'api/singer'

  // vuex
  import {mapGetters} from 'vuex'

  // 引入模板
  import musicList from 'components/music-list/music-list'

  export default{
    computed: {
      ...mapGetters([
        'singer'
      ]),
      bgImg() {
        return this.singer.avatar
      },
      title() {
        return this.singer.name
      }
    },
    components: {
      musicList
    },
    data() {
      return {
        songs: []
      }
    },
    created() {
      this._getSingerDetail()
    },
    methods: {
      _getSingerDetail() {
        if (!this.singer.id) {
          this.$router.push({
            path: '/singer'
          })
        }
        getSingerDetail(this.singer.id).then(res => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      },
      _normalizeSongs(list) {
        let res = []
        list.forEach(data => {
          let musicData = data.musicData
          if (musicData.songid && musicData.albumid) {
            res.push(createSong(musicData))
          }
        })
        return res
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
