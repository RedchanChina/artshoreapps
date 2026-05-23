<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { initCloudBase } from '@/api/cloudbase'

onLaunch(() => {
  initCloudBase()
  console.log('ArtShop App Launch')
})

onShow(() => {
  console.log('ArtShop App Show')
})

onHide(() => {
  console.log('ArtShop App Hide')
})
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
