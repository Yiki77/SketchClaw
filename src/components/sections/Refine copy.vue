<script setup lang="ts">

import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive
} from 'vue'

import {
  VideoPlay,
  RefreshRight
} from '@element-plus/icons-vue'


// ============================================================
// Props
// ============================================================

interface RefineProps {
  embedded?: boolean
  showTitle?: boolean
}


withDefaults(
  defineProps<RefineProps>(),
  {
    embedded: false,
    showTitle: true
  }
)


// ============================================================
// Types
// ============================================================

interface RefineConfig {
  id: string
  title: string
  caption: string
  folder: string
  draft: string
}


interface RefineExample extends RefineConfig {
  frames: string[]
  currentImageIndex: number
  loading: boolean
  playing: boolean
  error: string
}


// ============================================================
// Configuration
// ============================================================

/*
  每个文件夹：

  draft.png
  1.png
  2.png
  3.png
  ...

  currentImageIndex:

  0 代表 draft.png
  1 代表 1.png
  2 代表 2.png
  ...
*/

const exampleConfigs: RefineConfig[] = [

  {
    id: 'refine1',

    title: 'Example 1',

    caption:
      'A dragon flying above a medieval castle.',

    folder: '/refine/1',

    draft: '/refine/1/draft.png'
  },


  {
    id: 'refine2',

    title: 'Example 2',

    caption:
      'A small castle stands between two tall pine trees.',

    folder: '/refine/2',

    draft: '/refine/2/draft.png'
  },


  {
    id: 'refine3',

    title: 'Example 3',

    caption:
      'A cat sits beside a window, with plants growing near the window.',

    folder: '/refine/3',

    draft: '/refine/3/draft.png'
  },


  {
    id: 'refine4',

    title: 'Example 4',

    caption:
      'A fisherman sits on a rock mending his net, with a fish basket and oars beside him. Waves ripple across the sea, and another small boat can be seen in the distance.',

    folder: '/refine/4',

    draft: '/refine/4/draft.png'
  },


  {
    id: 'refine5',

    title: 'Example 5',

    caption:
      'Two stone lions stand on either side of the temple steps.',

    folder: '/refine/5',

    draft: '/refine/5/draft.png'
  }

]


// ============================================================
// State
// ============================================================

const examples = reactive<RefineExample[]>(

  exampleConfigs.map((config) => ({

    ...config,

    frames: [],

    currentImageIndex: 0,

    loading: true,

    playing: false,

    error: ''

  }))

)


// ============================================================
// Animation settings
// ============================================================

// 最多自动检测多少张优化帧

const MAX_FRAME_COUNT = 100


// 每张优化帧显示时间

const FRAME_DURATION = 600


// 最后一张图停留时间

const FINAL_FRAME_HOLD = 1000


// 每个例子对应一个定时器

const animationTimers =
  new Map<string, number>()


// ============================================================
// Image preloading
// ============================================================

/*
  不只是检测图像是否存在，也等待浏览器完成 decode。

  这样图片开始播放时已经进入浏览器缓存并完成解码，
  可以减少图像切换时的闪烁和空白。
*/

const preloadImage = (
  url: string
): Promise<boolean> => {

  return new Promise((resolve) => {

    const image = new Image()


    image.onload = async () => {

      try {

        if (typeof image.decode === 'function') {

          await image.decode()

        }

      } catch {

        // 即使 decode 失败，只要 onload 成功，
        // 仍然认为图片可以显示。

      }


      resolve(true)

    }


    image.onerror = () => {

      resolve(false)

    }


    image.src = url

  })

}


// ============================================================
// Load refinement frames
// ============================================================

const loadExample = async (
  example: RefineExample
) => {

  example.loading = true

  example.error = ''


  try {

    // 先加载 draft

    const draftExists =
      await preloadImage(
        example.draft
      )


    if (!draftExists) {

      throw new Error(
        `Unable to load ${example.draft}`
      )

    }


    const discoveredFrames: string[] = []


    // 自动检测 1.png、2.png、3.png...

    for (
      let frameIndex = 1;
      frameIndex <= MAX_FRAME_COUNT;
      frameIndex += 1
    ) {

      const frameUrl =
        `${example.folder}/${frameIndex}.png`


      const frameExists =
        await preloadImage(frameUrl)


      if (!frameExists) {

        break

      }


      discoveredFrames.push(
        frameUrl
      )

    }


    if (
      discoveredFrames.length === 0
    ) {

      throw new Error(
        `No refinement frames were found in ${example.folder}.`
      )

    }


    example.frames =
      discoveredFrames

    example.currentImageIndex = 0

  } catch (error) {

    example.error =
      error instanceof Error
        ? error.message
        : 'Failed to load the refinement example.'

  } finally {

    example.loading = false

  }

}


// ============================================================
// Displayed images
// ============================================================

/*
  返回 draft + 所有 refinement frames。

  所有图片会同时存在于 DOM 中并重叠放置，
  只是通过 opacity 决定哪一张显示。
  这样不会在每次切换时重新创建 img 或切换网络资源。
*/

const getAllImages = (
  example: RefineExample
) => {

  return [
    example.draft,
    ...example.frames
  ]

}


// ============================================================
// Animation helpers
// ============================================================

const clearExampleTimer = (
  exampleId: string
) => {

  const timer =
    animationTimers.get(exampleId)


  if (timer !== undefined) {

    window.clearTimeout(timer)

    animationTimers.delete(
      exampleId
    )

  }

}


const stopExample = (
  example: RefineExample,
  restoreDraft = true
) => {

  clearExampleTimer(
    example.id
  )


  example.playing = false


  if (restoreDraft) {

    example.currentImageIndex = 0

  }

}


const stopAllExamples = (
  exceptExampleId?: string
) => {

  examples.forEach((example) => {

    if (
      example.id !== exceptExampleId
    ) {

      stopExample(
        example,
        true
      )

    }

  })

}


// ============================================================
// Play refinement
// ============================================================

const showAnimationFrame = (
  example: RefineExample,
  frameIndex: number
) => {

  /*
    frameIndex 从 1 开始：

    1 -> 1.png
    2 -> 2.png
    ...
  */

  example.currentImageIndex =
    frameIndex


  const isLastFrame =

    frameIndex
    >= example.frames.length


  if (isLastFrame) {

    // 最后一帧停留 1 秒后恢复 draft

    const timer =
      window.setTimeout(() => {

        example.currentImageIndex = 0

        example.playing = false


        animationTimers.delete(
          example.id
        )

      }, FINAL_FRAME_HOLD)


    animationTimers.set(
      example.id,
      timer
    )


    return

  }


  // 播放下一帧

  const timer =
    window.setTimeout(() => {

      showAnimationFrame(
        example,
        frameIndex + 1
      )

    }, FRAME_DURATION)


  animationTimers.set(
    example.id,
    timer
  )

}


const playExample = (
  example: RefineExample
) => {

  if (
    example.loading
    || example.error
    || example.frames.length === 0
  ) {

    return

  }


  // 正在播放时再次点击，则回到 draft

  if (example.playing) {

    stopExample(
      example,
      true
    )

    return

  }


  // 只允许一个例子同时播放

  stopAllExamples(
    example.id
  )


  clearExampleTimer(
    example.id
  )


  example.currentImageIndex = 0

  example.playing = true


  // 立即显示第一张优化帧

  showAnimationFrame(
    example,
    1
  )

}


// ============================================================
// Keyboard access
// ============================================================

const handleCardKeydown = (
  event: KeyboardEvent,
  example: RefineExample
) => {

  if (
    event.key === 'Enter'
    || event.key === ' '
  ) {

    event.preventDefault()

    playExample(example)

  }

}


// ============================================================
// Status
// ============================================================

const getStatusText = (
  example: RefineExample
) => {

  if (example.playing) {

    return 'Refining...'

  }


  if (
    example.currentImageIndex === 0
  ) {

    return 'Click to refine'

  }


  return 'Refined'

}


const getFrameText = (
  example: RefineExample
) => {

  if (
    example.currentImageIndex === 0
  ) {

    return 'Draft'

  }


  return (
    `${String(example.currentImageIndex).padStart(2, '0')}`
    + ' / '
    + `${String(example.frames.length).padStart(2, '0')}`
  )

}


// ============================================================
// Lifecycle
// ============================================================

onMounted(() => {

  examples.forEach((example) => {

    loadExample(example)

  })

})


onBeforeUnmount(() => {

  examples.forEach((example) => {

    clearExampleTimer(
      example.id
    )

  })

})

</script>


<template>

  <div
    class="refine-section"
    :class="{
      'refine-embedded': embedded
    }"
  >


    <!-- Standalone divider -->

    <el-divider v-if="!embedded" />


    <!-- Standalone title -->

    <el-row
      v-if="!embedded && showTitle"
      justify="center"
    >

      <h1 class="section-title">
        Structure-aware Refinement
      </h1>

    </el-row>


    <!-- Embedded title -->

    <el-row
      v-if="embedded && showTitle"
      justify="center"
    >

      <h2 class="refine-subtitle">
        Structure-aware Refinement
      </h2>

    </el-row>


    <!-- ================================================== -->
    <!-- Introduction -->
    <!-- ================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <p class="refine-desc">

          We visualize how structure-aware refinement progressively
          transforms coarse scene drafts into detailed sketches while
          preserving their object structures and spatial layouts.
          Click each example to inspect its refinement process.

        </p>

      </el-col>

    </el-row>


    <!-- ================================================== -->
    <!-- Example grid -->
    <!-- ================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div class="refine-grid">


          <article
            v-for="example in examples"
            :key="example.id"
            class="refine-example"
          >


            <!-- Example information -->

            <div class="example-header">


              <span class="example-title">

                {{ example.title }}

              </span>


              <span class="example-frame">

                {{ getFrameText(example) }}

              </span>


            </div>


            <!-- Caption -->

            <p class="scene-caption">

              “{{ example.caption }}”

            </p>


            <!-- Loading -->

            <div
              v-if="example.loading"
              class="refine-card state-card"
            >

              <el-skeleton
                animated
                :rows="5"
              />

            </div>


            <!-- Error -->

            <div
              v-else-if="example.error"
              class="
                refine-card
                state-card
                error-state
              "
            >

              {{ example.error }}

            </div>


            <!-- Interactive refinement -->

            <div
              v-else
              class="refine-card"
              role="button"
              tabindex="0"
              :aria-label="
                `${example.title}: click to play refinement`
              "
              @click="playExample(example)"
              @keydown="
                handleCardKeydown(
                  $event,
                  example
                )
              "
            >


              <!-- Image stage -->

              <div class="image-stage">


                <!--
                  所有图片预先渲染并重叠放置。
                  只改变 opacity，避免 img src 切换闪烁。
                -->

                <img
                  v-for="(imageUrl, imageIndex) in getAllImages(example)"
                  :key="
                    `${example.id}-image-${imageIndex}`
                  "
                  :src="imageUrl"
                  :alt="
                    imageIndex === 0
                      ? `${example.title} draft`
                      : `${example.title} refinement frame ${imageIndex}`
                  "
                  class="refinement-image"
                  :class="{
                    'refinement-image-active':
                      imageIndex
                      === example.currentImageIndex
                  }"
                  loading="eager"
                  decoding="sync"
                  draggable="false"
                />


                <!-- Draft label -->

                <div
                  class="stage-label"
                  :class="{
                    'stage-label-playing':
                      example.playing
                  }"
                >

                  {{
                    example.currentImageIndex === 0
                      ? 'Initial Draft'
                      : 'Structure-aware Refinement'
                  }}

                </div>


                <!-- Click overlay -->

                <div
                  class="play-overlay"
                  :class="{
                    'play-overlay-hidden':
                      example.playing
                  }"
                >


                  <div class="play-circle">

                    <el-icon>

                      <VideoPlay />

                    </el-icon>

                  </div>


                  <span>

                    {{ getStatusText(example) }}

                  </span>


                </div>


                <!-- Playing indicator -->

                <div
                  v-if="example.playing"
                  class="playing-indicator"
                >


                  <el-icon class="playing-icon">

                    <RefreshRight />

                  </el-icon>


                  <span>
                    Refining
                  </span>


                </div>


              </div>


              <!-- Bottom status -->

              <div class="card-footer">


                <span>

                  {{
                    example.playing
                      ? 'Click to stop'
                      : 'Click the image to replay'
                  }}

                </span>


                <div
                  class="frame-dots"
                  aria-hidden="true"
                >


                  <span
                    class="frame-dot"
                    :class="{
                      'frame-dot-active':
                        example.currentImageIndex === 0
                    }"
                  />


                  <span
                    v-for="frameIndex in example.frames.length"
                    :key="
                      `${example.id}-dot-${frameIndex}`
                    "
                    class="frame-dot"
                    :class="{
                      'frame-dot-active':
                        example.currentImageIndex === frameIndex
                    }"
                  />


                </div>


              </div>


            </div>


          </article>


        </div>

      </el-col>

    </el-row>


  </div>

</template>


<style scoped>


/* ============================================================
   Section
   ============================================================ */

.refine-section {

  width: 100%;

}


.refine-embedded {

  margin-top: 0;

}


/* ============================================================
   Description
   ============================================================ */

.refine-desc {

  margin:
    0
    0
    28px;

  color: #000;

  font-size: 16px;

  line-height: 1.8;

  text-align: justify;

}


/* ============================================================
   Grid
   ============================================================ */

.refine-grid {

  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap:
    22px
    18px;

  width: 100%;

  margin:
    8px
    0
    48px;

}


/* ============================================================
   Example
   ============================================================ */

.refine-example {

  min-width: 0;

}


.example-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  margin-bottom: 7px;

}


.example-title {

  color: #252525;

  font-size: 14px;

  font-weight: 600;

}


.example-frame {

  flex-shrink: 0;

  color: #929292;

  font-family:
    Consolas,
    Monaco,
    "Courier New",
    monospace;

  font-size: 9px;

  letter-spacing: 0.025em;

  text-transform: uppercase;

}


.scene-caption {

  display: -webkit-box;

  min-height: 48px;

  margin:
    0
    0
    10px;

  overflow: hidden;

  color: #333;

  font-size: 12px;

  font-style: italic;

  line-height: 1.55;

  text-align: left;

  -webkit-box-orient: vertical;

  -webkit-line-clamp: 2;

}


/* ============================================================
   Card
   ============================================================ */

.refine-card {

  width: 100%;

  overflow: hidden;

  background: #fff;

  border:
    1px
    solid
    #dedfe2;

  border-radius: 9px;

  box-shadow:
    0
    4px
    14px
    rgba(0, 0, 0, 0.045);

  box-sizing: border-box;

  cursor: pointer;

  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

}


.refine-card:hover {

  border-color: #bfc2c7;

  box-shadow:
    0
    7px
    20px
    rgba(0, 0, 0, 0.075);

  transform:
    translateY(-2px);

}


.refine-card:focus-visible {

  box-shadow:
    0
    0
    0
    2px
    rgba(55, 55, 55, 0.16);

}


.state-card {

  min-height: 290px;

  padding: 18px;

  cursor: default;

}


.error-state {

  display: flex;

  align-items: center;

  justify-content: center;

  color: #c93b40;

  font-size: 12px;

  line-height: 1.6;

  text-align: center;

}


/* ============================================================
   Image stage
   ============================================================ */

.image-stage {

  position: relative;

  width: 100%;

  aspect-ratio: 1 / 1;

  overflow: hidden;

  background: #fff;

  user-select: none;

}


/* ============================================================
   Layered images
   ============================================================ */

.refinement-image {

  position: absolute;

  inset: 0;

  z-index: 1;

  display: block;

  width: 100%;

  height: 100%;

  padding: 7px;

  object-fit: contain;

  opacity: 0;

  pointer-events: none;

  box-sizing: border-box;

  transform:
    scale(1.002);

  transition:
    opacity
    170ms
    linear;

  user-select: none;

  will-change: opacity;

}


.refinement-image-active {

  z-index: 2;

  opacity: 1;

}


/* ============================================================
   Stage label
   ============================================================ */

.stage-label {

  position: absolute;

  top: 9px;

  left: 9px;

  z-index: 8;

  padding:
    5px
    8px;

  color: #686868;

  font-size: 8px;

  font-weight: 600;

  letter-spacing: 0.03em;

  text-transform: uppercase;

  background:
    rgba(
      240,
      240,
      240,
      0.9
    );

  border-radius: 4px;

  backdrop-filter:
    blur(5px);

  transition:
    color 0.2s ease,
    background-color 0.2s ease;

}


.stage-label-playing {

  color: #a82e33;

  background:
    rgba(
      255,
      229,
      230,
      0.92
    );

}


/* ============================================================
   Play overlay
   ============================================================ */

.play-overlay {

  position: absolute;

  inset: 0;

  z-index: 7;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 8px;

  color: #444;

  font-size: 10px;

  font-weight: 600;

  letter-spacing: 0.02em;

  background:
    rgba(
      255,
      255,
      255,
      0
    );

  opacity: 0;

  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;

}


.refine-card:hover
.play-overlay {

  background:
    rgba(
      255,
      255,
      255,
      0.52
    );

  opacity: 1;

}


.play-overlay-hidden {

  visibility: hidden;

  opacity: 0;

}


.play-circle {

  display: flex;

  align-items: center;

  justify-content: center;

  width: 42px;

  height: 42px;

  color: #fff;

  font-size: 20px;

  background:
    rgba(
      45,
      45,
      45,
      0.84
    );

  border-radius: 50%;

  box-shadow:
    0
    3px
    10px
    rgba(0, 0, 0, 0.16);

}


/* ============================================================
   Playing indicator
   ============================================================ */

.playing-indicator {

  position: absolute;

  right: 9px;

  bottom: 9px;

  z-index: 8;

  display: flex;

  align-items: center;

  gap: 5px;

  padding:
    5px
    8px;

  color: #a72e33;

  font-size: 8px;

  font-weight: 600;

  letter-spacing: 0.025em;

  text-transform: uppercase;

  background:
    rgba(
      255,
      231,
      232,
      0.94
    );

  border-radius: 4px;

  backdrop-filter:
    blur(5px);

}


.playing-icon {

  animation:
    refine-rotate
    1s
    linear
    infinite;

}


@keyframes refine-rotate {

  from {

    transform:
      rotate(0deg);

  }

  to {

    transform:
      rotate(360deg);

  }

}


/* ============================================================
   Footer
   ============================================================ */

.card-footer {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 10px;

  min-height: 35px;

  padding:
    7px
    10px;

  color: #919191;

  font-size: 8px;

  background: #f4f4f4;

  border-top:
    1px
    solid
    #dfdfdf;

  box-sizing: border-box;

}


.frame-dots {

  display: flex;

  align-items: center;

  justify-content: flex-end;

  gap: 3px;

  min-width: 0;

  overflow: hidden;

}


.frame-dot {

  flex-shrink: 0;

  width: 4px;

  height: 4px;

  background: #c8c8c8;

  border-radius: 50%;

  transition:
    width 0.15s ease,
    background-color 0.15s ease;

}


.frame-dot-active {

  width: 10px;

  background: #c9343a;

  border-radius: 4px;

}


/* ============================================================
   Responsive
   ============================================================ */
@media (max-width: 1199px) {
  .refine-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}


@media (max-width: 767px) {
  .refine-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
  }

  .scene-caption {
    min-height: auto;
    -webkit-line-clamp: 3;
  }
}


@media (max-width: 480px) {
  .refine-grid {
    margin-bottom: 40px;
  }

  .example-title {
    font-size: 13px;
  }

  .scene-caption {
    font-size: 11px;
  }

  .play-overlay {
    background: rgba(255, 255, 255, 0.3);
    opacity: 1;
  }
}

</style>