// 属性
import * as types from './mutation-types'
import {playMode} from 'common/js/config'

// 方法
import {shuffle} from 'common/js/util'
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from 'common/js/cache'

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

export const selectPlay = function ({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) { // 在随机状态下  点击 歌曲之后  要判断打乱顺序后的歌曲的地址 返回之后 在打乱顺序的歌曲地址里面找到他
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)
        index = findIndex(randomList, list[index])
    } else {
        commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}
// 随机播放
export const randomPlay = function({commit}, {list}) {
    commit(types.SET_SEQUENCE_LIST, list)
    commit(types.SET_PLAY_MODE, playMode.random)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

// 搜索页面插入的歌曲
export const insertSong = function ({commit, state}, song) {
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    // 记录当前要播放的歌
    let currentSong = playlist[currentIndex]

    // 找到这首歌是否存在于歌曲的列表
    let fpIndex = findIndex(playlist, song)

    // 因为是插入歌曲 索引要 +1  否则就是把当前的歌曲给替换了
    currentIndex++

    // 搜索的歌加入当前列表
    playlist.splice(currentIndex, 0, song)

    if (fpIndex > -1) {
        // 如果当前插入的序号大于列表中的序号
        if (currentIndex > fpIndex) {
            playlist.splice(fpIndex, 1)
            currentIndex--
        } else {
            playlist.splice(fpIndex + 1, 1)
        }
        }

        let currentSIndex = findIndex(sequenceList, currentSong) + 1

        let fsIndex = findIndex(sequenceList, song)

        sequenceList.splice(currentSIndex, 0, song)

        if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1)
        } else {
            sequenceList.splice(fsIndex + 1, 1)
        }
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

// 保存搜索记录
export const saveSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 删除某一条历史记录
export const delSerchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 删除所有历史记录
export const clearSearchAll = function ({commit}) {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 删除某一首歌
export const deleteSong = function ({commit, state}, song) {
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    let pIndex = findIndex(playlist, song)
    playlist.splice(pIndex, 1)

    let sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)

    if (currentIndex > pIndex || currentIndex === playlist.length) {
        currentIndex--
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_SEQUENCE_LIST, sequenceList)

    const playingState = playlist.length > 0

    commit(types.SET_PLAYING_STATE, playingState)
}

// 清空列表
export const clearPlayList = function ({commit, state}) {
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_PLAYING_STATE, false)
}

// 保存播放历史
export const savePlayHistory = function ({commit}, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}

// 保存喜欢的歌曲
export const saveFavoriteList = function ({commit}, song) {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

// 删除喜欢的歌曲
export const deleteFavoriteList = function ({commit}, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
