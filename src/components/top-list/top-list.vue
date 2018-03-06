<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-img="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  // 属性 | 方法
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  // 组件
  import MusicList from 'components/music-list/music-list'

  // vuex
  import {mapGetters} from 'vuex'

  // 请求榜单 歌曲资源
  import {getMusicList} from 'api/rank'

  export default{
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        if (this.song.length) {
          return this.song[0].image
        }
        return ''
      },
      songs() {
        return this.song
      },
      ...mapGetters([
        'topList'
      ])
    },
    methods: {
      _getTopList() {
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        getMusicList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.song = this._normalizeSongs(res.songlist)
          }
        })
      },
      _normalizeSongs(list) {
        let arr = []
        list.forEach((item) => {
          const musicData = item.data
          if (musicData.songid && musicData.albumid) {
            arr.push(createSong(musicData))
          }
        })
        return arr
      }
    },
    data() {
      return {
        song: [],
        rank: true
      }
    },
    created() {
      this._getTopList()
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
