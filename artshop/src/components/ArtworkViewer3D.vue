<template>
  <view class="viewer-3d">
    <view
      ref="containerRef"
      class="viewer-3d__canvas"
      id="viewer3d-container"
    />
    <view class="viewer-3d__hint" v-if="showHint">
      <text class="viewer-3d__hint-text">拖动旋转 · 双指缩放</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = withDefaults(defineProps<{
  imageUrl: string
  material: string
  frameStyle: string
  width: number
  height: number
}>(), {
  imageUrl: '',
  material: '艺术微喷',
  frameStyle: '黑框',
  width: 60,
  height: 80,
})

const containerRef = ref<any>(null)
const showHint = ref(true)

let scene: any = null
let camera: any = null
let renderer: any = null
let controls: any = null
let frameGroup: any = null
let artworkMesh: any = null
let frameBorderMesh: any = null
let animationFrameId: number = 0
let textureLoader: any = null

const FRAME_COLORS: Record<string, number> = {
  '黑框': 0x2c2c2c,
  '白框': 0xf0ece8,
  '铁灰框': 0x7a7a7a,
  '无框': 0xd4c5b0,
}

function initScene() {
  const container = document.getElementById('viewer3d-container')
  if (!container) return

  const w = container.clientWidth
  const h = container.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0ece8)
  scene.fog = new THREE.Fog(0xf0ece8, 8, 18)

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
  camera.position.set(0, 1.5, 4.5)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 2
  controls.maxDistance = 8
  controls.maxPolarAngle = Math.PI * 0.65
  controls.minPolarAngle = Math.PI * 0.2
  controls.target.set(0, 1.5, 0)
  controls.update()

  textureLoader = new THREE.TextureLoader()

  createRoom()
  createLighting()
  createFrame()

  animate()

  setTimeout(() => {
    showHint.value = false
  }, 3000)
}

function createRoom() {
  const wallGeo = new THREE.PlaneGeometry(10, 6)
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xe8e4e0,
    roughness: 0.92,
    metalness: 0.0,
  })
  const wall = new THREE.Mesh(wallGeo, wallMat)
  wall.position.set(0, 3, -2)
  wall.receiveShadow = true
  scene.add(wall)

  const sideWallGeo = new THREE.PlaneGeometry(6, 6)
  const sideWallMat = new THREE.MeshStandardMaterial({
    color: 0xe2deda,
    roughness: 0.92,
    metalness: 0.0,
  })
  const leftWall = new THREE.Mesh(sideWallGeo, sideWallMat)
  leftWall.position.set(-5, 3, 1)
  leftWall.rotation.y = Math.PI / 2
  leftWall.receiveShadow = true
  scene.add(leftWall)

  const floorGeo = new THREE.PlaneGeometry(10, 8)
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xc4b6a6,
    roughness: 0.85,
    metalness: 0.02,
  })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, 1)
  floor.receiveShadow = true
  scene.add(floor)

  const baseboardGeo = new THREE.BoxGeometry(10, 0.12, 0.04)
  const baseboardMat = new THREE.MeshStandardMaterial({
    color: 0xb5a898,
    roughness: 0.7,
  })
  const baseboard = new THREE.Mesh(baseboardGeo, baseboardMat)
  baseboard.position.set(0, 0.06, -1.98)
  scene.add(baseboard)
}

function createLighting() {
  const ambient = new THREE.AmbientLight(0xfff8f0, 0.6)
  scene.add(ambient)

  const dirLight = new THREE.DirectionalLight(0xfff5ee, 0.8)
  dirLight.position.set(3, 5, 4)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  dirLight.shadow.camera.near = 0.5
  dirLight.shadow.camera.far = 20
  dirLight.shadow.camera.left = -5
  dirLight.shadow.camera.right = 5
  dirLight.shadow.camera.top = 5
  dirLight.shadow.camera.bottom = -5
  scene.add(dirLight)

  const spotLight = new THREE.SpotLight(0xfff0e6, 1.2, 10, Math.PI / 6, 0.5, 1)
  spotLight.position.set(0, 4.5, 1.5)
  spotLight.target.position.set(0, 1.5, -1.8)
  spotLight.castShadow = true
  scene.add(spotLight)
  scene.add(spotLight.target)

  const fillLight = new THREE.PointLight(0xd4c5b0, 0.3, 8)
  fillLight.position.set(-2, 2, 2)
  scene.add(fillLight)
}

function createFrame() {
  if (frameGroup) {
    scene.remove(frameGroup)
    frameGroup.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (child.material.map) child.material.map.dispose()
        child.material.dispose()
      }
    })
  }

  frameGroup = new THREE.Group()

  const aspectRatio = props.width / props.height
  const frameH = 1.6
  const frameW = frameH * aspectRatio
  const borderWidth = props.frameStyle === '无框' ? 0.02 : 0.08
  const frameDepth = 0.05

  const artworkW = frameW - borderWidth * 2
  const artworkH = frameH - borderWidth * 2

  const artworkGeo = new THREE.PlaneGeometry(artworkW, artworkH)
  let artworkMat: any

  if (props.imageUrl) {
    const texture = textureLoader.load(props.imageUrl, (tex: any) => {
      tex.colorSpace = THREE.SRGBColorSpace
      artworkMat.needsUpdate = true
    })
    texture.colorSpace = THREE.SRGBColorSpace
    artworkMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: props.material === '亚克力三明治' ? 0.15 : 0.7,
      metalness: props.material === '亚克力三明治' ? 0.1 : 0.0,
    })
  } else {
    artworkMat = new THREE.MeshStandardMaterial({
      color: 0xd4c5b0,
      roughness: 0.7,
    })
  }
  artworkMesh = new THREE.Mesh(artworkGeo, artworkMat)
  artworkMesh.position.z = frameDepth / 2 + 0.002
  frameGroup.add(artworkMesh)

  if (props.frameStyle !== '无框') {
    const frameColor = FRAME_COLORS[props.frameStyle] || 0x2c2c2c
    const frameMat = new THREE.MeshStandardMaterial({
      color: frameColor,
      roughness: 0.4,
      metalness: 0.05,
    })

    const topGeo = new THREE.BoxGeometry(frameW + borderWidth * 2, borderWidth, frameDepth)
    const topFrame = new THREE.Mesh(topGeo, frameMat)
    topFrame.position.set(0, frameH / 2 + borderWidth / 2, 0)
    topFrame.castShadow = true
    frameGroup.add(topFrame)

    const bottomGeo = new THREE.BoxGeometry(frameW + borderWidth * 2, borderWidth, frameDepth)
    const bottomFrame = new THREE.Mesh(bottomGeo, frameMat)
    bottomFrame.position.set(0, -frameH / 2 - borderWidth / 2, 0)
    bottomFrame.castShadow = true
    frameGroup.add(bottomFrame)

    const leftGeo = new THREE.BoxGeometry(borderWidth, frameH, frameDepth)
    const leftFrame = new THREE.Mesh(leftGeo, frameMat)
    leftFrame.position.set(-frameW / 2 - borderWidth / 2, 0, 0)
    leftFrame.castShadow = true
    frameGroup.add(leftFrame)

    const rightGeo = new THREE.BoxGeometry(borderWidth, frameH, frameDepth)
    const rightFrame = new THREE.Mesh(rightGeo, frameMat)
    rightFrame.position.set(frameW / 2 + borderWidth / 2, 0, 0)
    rightFrame.castShadow = true
    frameGroup.add(rightFrame)

    frameBorderMesh = frameGroup
  } else {
    const edgeGeo = new THREE.BoxGeometry(frameW + 0.04, frameH + 0.04, 0.02)
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xd4c5b0,
      roughness: 0.6,
    })
    const edge = new THREE.Mesh(edgeGeo, edgeMat)
    edge.position.z = -0.005
    frameGroup.add(edge)
  }

  if (props.material === '亚克力三明治') {
    const acrylicGeo = new THREE.PlaneGeometry(artworkW, artworkH)
    const acrylicMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      roughness: 0.05,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    })
    const acrylic = new THREE.Mesh(acrylicGeo, acrylicMat)
    acrylic.position.z = frameDepth / 2 + 0.005
    frameGroup.add(acrylic)
  }

  frameGroup.position.set(0, 1.8, -1.95)
  scene.add(frameGroup)
}

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function handleResize() {
  const container = document.getElementById('viewer3d-container')
  if (!container || !camera || !renderer) return
  const w = container.clientWidth
  const h = container.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function resetView() {
  if (!camera || !controls) return
  camera.position.set(0, 1.5, 4.5)
  controls.target.set(0, 1.5, 0)
  controls.update()
}

function updateFrame() {
  createFrame()
}

watch(() => [props.material, props.frameStyle, props.width, props.height], () => {
  nextTick(() => {
    updateFrame()
  })
})

watch(() => props.imageUrl, (newUrl) => {
  if (!newUrl || !textureLoader || !artworkMesh) return
  const texture = textureLoader.load(newUrl, (tex: any) => {
    tex.colorSpace = THREE.SRGBColorSpace
    if (artworkMesh && artworkMesh.material) {
      artworkMesh.material.needsUpdate = true
    }
  })
  texture.colorSpace = THREE.SRGBColorSpace
  if (artworkMesh && artworkMesh.material) {
    if (artworkMesh.material.map) artworkMesh.material.map.dispose()
    artworkMesh.material.map = texture
    artworkMesh.material.roughness = props.material === '亚克力三明治' ? 0.15 : 0.7
    artworkMesh.material.metalness = props.material === '亚克力三明治' ? 0.1 : 0.0
    artworkMesh.material.needsUpdate = true
  }
})

onMounted(() => {
  nextTick(() => {
    initScene()
    window.addEventListener('resize', handleResize)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (controls) {
    controls.dispose()
    controls = null
  }
  if (renderer) {
    renderer.dispose()
    const container = document.getElementById('viewer3d-container')
    if (container && renderer.domElement && renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement)
    }
    renderer = null
  }
  if (scene) {
    scene.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => {
            if (m.map) m.map.dispose()
            m.dispose()
          })
        } else {
          if (child.material.map) child.material.map.dispose()
          child.material.dispose()
        }
      }
    })
    scene = null
  }
  camera = null
  frameGroup = null
  artworkMesh = null
  frameBorderMesh = null
})

defineExpose({ resetView })
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.viewer-3d {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f0ece8;

  &__canvas {
    width: 100%;
    height: 100%;
  }

  &__hint {
    position: absolute;
    bottom: 40rpx;
    left: 50%;
    transform: translateX(-50%);
    padding: $spacing-xs $spacing-base;
    background-color: rgba(44, 44, 44, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: $radius-full;
    pointer-events: none;
    animation: hintFade 3s ease forwards;
  }

  &__hint-text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 2rpx;
  }
}

@keyframes hintFade {
  0% {
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
