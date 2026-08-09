<template>
  <div>
    <YouTube src="" width="360" height="250" @ready="onReady" @state-change="onStateChange" ref="youtube" />
    <button v-if="gameStore.isRoundOver && gameStore.round + 1 >= num_songs" @click="gameStore.isGameOver = true">
      VIEW RESULTS >
    </button>
    <button v-else-if="gameStore.isRoundOver" @click="nextRound">(SONG {{ gameStore.round + 2 }}) ></button>
  </div>
</template>

<script setup lang="ts">
import YouTube from 'vue3-youtube'
import { ref, onBeforeUnmount, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useGameStore } from '@/stores/game'
import { num_songs } from '../../config.json'

const playerStore = usePlayerStore()
const gameStore = useGameStore()

const props = defineProps<{ id: string }>()

const youtube = ref<InstanceType<typeof YouTube> | null>(null)

let player: InstanceType<typeof YouTube>
let endTimeout: ReturnType<typeof setTimeout> | null = null
let prebuffering = false

const prebuffer = () => {
  if (endTimeout) {
    clearTimeout(endTimeout)
    endTimeout = null
  }
  playerStore.setLoadingState(true)
  player.mute()
  player.loadVideoById(props.id, playerStore.startTime, 'small')
  prebuffering = true
}

const onStateChange = (e: { data: number }) => {
  if (prebuffering && e.data === 1 /* YT.PlayerState.PLAYING */) {
    player.pauseVideo()
    player.seekTo(playerStore.startTime, true)
    player.unMute()
    player.setVolume(100)
    prebuffering = false
    playerStore.setLoadingState(false)
  }
}

const handlePlaySong = (startTime: number, endDelay?: number) => {
  player.seekTo(startTime, true)
  player.playVideo()

  if (!endDelay) return

  if (endTimeout !== null) {
    clearTimeout(endTimeout)
    endTimeout = null
  }

  endTimeout = setTimeout(() => {
    player.pauseVideo()
    player.seekTo(startTime, true)
  }, endDelay * 1000)
}

watch(
  () => playerStore.playCount,
  () => {
    if (!playerStore.isLoading) handlePlaySong(playerStore.startTime, playerStore.endDelay)
  },
)

watch(
  () => gameStore.isRoundOver,
  () => {
    if (!gameStore.isRoundOver) prebuffer()
  },
)

const onReady = () => {
  player = youtube.value!
  prebuffer()
}

const nextRound = () => {
  if (gameStore.isRoundOver) gameStore.incrementRound()
}

onBeforeUnmount(() => {
  if (endTimeout) clearTimeout(endTimeout)
  prebuffering = false
  playerStore.setLoadingState(true)
})
</script>

<style scoped>
div {
  background-color: #e6e3e3;
  padding-top: 0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-bottom: 1rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  align-self: flex-end;
}
</style>
