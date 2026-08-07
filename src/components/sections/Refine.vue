<script setup lang="ts">

import {
  computed,
  onMounted,
  reactive,
  ref
} from 'vue'

import {
  ArrowLeft,
  ArrowRight
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
  loading: boolean
  error: string
}


// ============================================================
// Configuration
// ============================================================

/*
  每个文件夹的结构：

  draft.jpg
  1.jpg
  2.jpg
  3.jpg
  ...

  当前版本：

  1. 页面一次只展示一个 Example。
  2. 使用左右圆形箭头切换 Example。
  3. 当前 Example 的 Draft 和全部 refinement frames 同时展开。
  4. 不自动播放，也不使用横向或纵向滚动容器。
*/

const exampleConfigs: RefineConfig[] = [
  {
    id: 'refine1',
    title: 'Example 1',
    caption:
      'A dragon flying above a medieval castle.',
    folder: './refine/1',
    draft: './refine/1/draft.jpg'
  },
  {
    id: 'refine2',
    title: 'Example 2',
    caption:
      'A small castle stands between two tall pine trees.',
    folder: './refine/2',
    draft: './refine/2/draft.jpg'
  },
  {
    id: 'refine3',
    title: 'Example 3',
    caption:
      'A cat sits beside a window, with plants growing near the window.',
    folder: './refine/3',
    draft: './refine/3/draft.jpg'
  },
  {
    id: 'refine4',
    title: 'Example 4',
    caption:
      'A fisherman sits on a rock mending his net, with a fish basket and oars beside him. Waves ripple across the sea, and another small boat can be seen in the distance.',
    folder: './refine/4',
    draft: './refine/4/draft.jpg'
  }
]


// ============================================================
// State
// ============================================================

const examples = reactive<RefineExample[]>(
  exampleConfigs.map((config) => ({
    ...config,
    frames: [],
    loading: true,
    error: ''
  }))
)

const currentExampleIndex = ref(0)

const currentExample = computed(() => {
  return examples[currentExampleIndex.value]
})


// ============================================================
// Frame settings
// ============================================================

const MAX_FRAME_COUNT = 100


// ============================================================
// Image preloading
// ============================================================

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
        // decode 失败时，只要图片成功加载，仍然视为可显示。
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
    const draftExists =
      await preloadImage(example.draft)

    if (!draftExists) {
      throw new Error(
        `Unable to load ${example.draft}`
      )
    }

    const discoveredFrames: string[] = []

    for (
      let frameIndex = 1;
      frameIndex <= MAX_FRAME_COUNT;
      frameIndex += 1
    ) {
      const frameUrl =
        `${example.folder}/${frameIndex}.jpg`

      const frameExists =
        await preloadImage(frameUrl)

      if (!frameExists) {
        break
      }

      discoveredFrames.push(frameUrl)
    }

    if (discoveredFrames.length === 0) {
      throw new Error(
        `No refinement frames were found in ${example.folder}.`
      )
    }

    example.frames = discoveredFrames
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
// Example navigation
// ============================================================

const previousExample = () => {
  currentExampleIndex.value =
    (
      currentExampleIndex.value
      - 1
      + examples.length
    )
    % examples.length
}

const nextExample = () => {
  currentExampleIndex.value =
    (
      currentExampleIndex.value
      + 1
    )
    % examples.length
}

const selectExample = (
  exampleIndex: number
) => {
  currentExampleIndex.value = exampleIndex
}

const handleExampleKeydown = (
  event: KeyboardEvent
) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previousExample()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextExample()
  }
}


// ============================================================
// Sequence helpers
// ============================================================

const getAllImages = (
  example: RefineExample
) => {
  return [
    example.draft,
    ...example.frames
  ]
}

const getFrameLabel = (
  imageIndex: number,
  totalImages: number
) => {
  if (imageIndex === 0) {
    return 'Draft'
  }

  if (imageIndex === totalImages - 1) {
    return 'Final'
  }

  return `Step ${imageIndex}`
}

const getFrameDescription = (
  example: RefineExample,
  imageIndex: number,
  totalImages: number
) => {
  const frameLabel =
    getFrameLabel(
      imageIndex,
      totalImages
    )

  return (
    `${example.title} structure-aware refinement: `
    + frameLabel
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

</script>


<template>

  <div
    class="refine-section"
    :class="{
      'refine-embedded': embedded
    }"
  >


    <el-divider v-if="!embedded" />


    <el-row
      v-if="!embedded && showTitle"
      justify="center"
    >

      <h1 class="section-title">
        Structure-aware Refinement
      </h1>

    </el-row>


    <el-row
      v-if="embedded && showTitle"
      justify="center"
    >

      <h2 class="refine-subtitle">
        Structure-aware Refinement
      </h2>

    </el-row>


    <!-- ====================================================== -->
    <!-- Introduction -->
    <!-- ====================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <img
          src="/refine.jpg"
          alt="Structure-aware refinement overview"
          class="refine-image"
        />

        <p class="refine-desc">

          We visualize how structure-aware refinement progressively transforms coarse scene drafts into detailed sketches while preserving their object structures and spatial layouts. Specifically, the draft assets are first converted into structure-preserving optimization primitives through curve contour resampling, where each object is represented by a fixed set of resampled contour curves. The refinement process then performs progressive joint optimization, gradually enhancing object details while compositing them into the scene according to the established layout. 
  
        </p>


      </el-col>

    </el-row>


    <!-- ====================================================== -->
    <!-- One expanded example at a time -->
    <!-- ====================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div
          class="example-switcher"
          tabindex="0"
          aria-label="Structure-aware refinement examples"
          @keydown="handleExampleKeydown"
        >


          <button
            class="example-arrow example-arrow-left"
            type="button"
            aria-label="Previous refinement example"
            @click="previousExample"
          >

            <el-icon>
              <ArrowLeft />
            </el-icon>

          </button>


          <transition
            name="example-fade"
            mode="out-in"
          >

            <article
              :key="currentExample.id"
              class="refine-example"
            >


              <header class="example-header">

                <div class="example-heading-row">

                  <div class="example-heading">

                    <span class="example-title">
                      {{ currentExample.title }}
                    </span>

                  </div>

                  <span class="example-progress">
                    {{ String(currentExampleIndex + 1).padStart(2, '0') }}
                    /
                    {{ String(examples.length).padStart(2, '0') }}
                  </span>

                </div>

                <p class="scene-caption">
                  “{{ currentExample.caption }}”
                </p>

              </header>


              <div
                v-if="currentExample.loading"
                class="sequence-state-card"
              >

                <div class="skeleton-grid">

                  <el-skeleton-item
                    v-for="itemIndex in 4"
                    :key="itemIndex"
                    variant="image"
                    class="skeleton-frame"
                  />

                </div>

              </div>


              <div
                v-else-if="currentExample.error"
                class="sequence-state-card error-state"
              >
                {{ currentExample.error }}
              </div>


              <div
                v-else
                class="sequence-grid"
              >

                <figure
                  v-for="(
                    imageUrl,
                    imageIndex
                  ) in getAllImages(currentExample)"
                  :key="`${currentExample.id}-${imageIndex}`"
                  class="sequence-item"
                >

                  <div class="sequence-image-wrapper">

                    <el-image
                      class="sequence-image"
                      :src="imageUrl"
                      :alt="
                        getFrameDescription(
                          currentExample,
                          imageIndex,
                          currentExample.frames.length + 1
                        )
                      "
                      :preview-src-list="getAllImages(currentExample)"
                      :initial-index="imageIndex"
                      fit="contain"
                      preview-teleported
                      hide-on-click-modal
                      loading="eager"
                    />

                    <span
                      class="frame-label"
                      :class="{
                        'frame-label-draft':
                          imageIndex === 0,
                        'frame-label-final':
                          imageIndex === currentExample.frames.length
                      }"
                    >
                      {{
                        getFrameLabel(
                          imageIndex,
                          currentExample.frames.length + 1
                        )
                      }}
                    </span>

                  </div>

                  <figcaption class="frame-caption">

                    <span>
                      {{
                        getFrameLabel(
                          imageIndex,
                          currentExample.frames.length + 1
                        )
                      }}
                    </span>

                    <span class="frame-index">
                      {{ imageIndex + 1 }}
                      /
                      {{ currentExample.frames.length + 1 }}
                    </span>

                  </figcaption>

                </figure>

              </div>


              <div class="example-dots">

                <button
                  v-for="(example, exampleIndex) in examples"
                  :key="example.id"
                  type="button"
                  class="example-dot"
                  :class="{
                    'example-dot-active':
                      exampleIndex === currentExampleIndex
                  }"
                  :aria-label="`Show ${example.title}`"
                  @click="selectExample(exampleIndex)"
                />

              </div>


            </article>

          </transition>


          <button
            class="example-arrow example-arrow-right"
            type="button"
            aria-label="Next refinement example"
            @click="nextExample"
          >

            <el-icon>
              <ArrowRight />
            </el-icon>

          </button>


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
   Introduction
   ============================================================ */

.refine-image {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 0 22px;
  object-fit: contain;
}

.refine-desc {
  margin:
    0
    0
    32px;
  color: #000;
  font-size: 18px;
  line-height: 1.8;
  text-align: justify;
}


/* ============================================================
   Example switcher
   ============================================================ */

.example-switcher {
  --example-accent: #ffc862c4;
  --example-accent-soft: rgba(255, 200, 98, 0.16);
  --example-accent-text: #8a640f;

  position: relative;
  width: 100%;
  margin:
    4px
    0
    54px;
  padding: 0;
  box-sizing: border-box;
  outline: none;
}

.example-switcher:focus-visible {
  border-radius: 12px;
  box-shadow:
    0
    0
    0
    3px
    var(--example-accent-soft);
}

.refine-example {
  width: 100%;
  min-width: 0;
}


/* ============================================================
   Example arrows
   ============================================================ */

.example-arrow {
  position: absolute;
  top: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  color: #333;
  font-size: 19px;
  background: #fff;
  border:
    1px
    solid
    #d5d5d5;
  border-radius: 50%;
  box-shadow:
    0
    4px
    14px
    rgba(0, 0, 0, 0.11);
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.example-arrow:hover {
  color: var(--example-accent-text);
  background: var(--example-accent-soft);
  border-color: var(--example-accent);
  box-shadow:
    0
    7px
    18px
    rgba(0, 0, 0, 0.16);
}

.example-arrow:active {
  transform:
    translateY(-50%)
    scale(0.95);
}

.example-arrow:focus-visible {
  outline:
    2px
    solid
    var(--example-accent);
  outline-offset: 2px;
}

.example-arrow-left {
  left: -58px;
}

.example-arrow-right {
  right: -58px;
}


/* ============================================================
   Example header
   ============================================================ */

.example-header {
  margin-bottom: 0;
}

.example-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 7px;
}

.example-heading {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.example-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #252525;
  font-family: inherit;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 1.4;
  text-align: left;
}

.example-title::before {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background: var(--example-accent);
  border-radius: 50%;
  box-shadow:
    0
    0
    0
    4px
    var(--example-accent-soft);
  content: '';
}

.example-count {
  padding:
    3px
    8px;
  color: #777;
  font-family:
    Consolas,
    Monaco,
    "Courier New",
    monospace;
  font-size: 11px;
  letter-spacing: 0.02em;
  background: #f1f1f1;
  border-radius: 999px;
}

.example-progress {
  flex-shrink: 0;
  padding: 5px 9px;
  color: var(--example-accent-text);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.2;
  background: var(--example-accent-soft);
  border: 1px solid var(--example-accent);
  border-radius: 999px;
}

.scene-caption {
  margin:
    0
    0
    8px;
  color: #222;
  font-family: inherit;
  font-size: 15px;
  font-style: italic;
  font-weight: 400;
  line-height: 1.65;
  text-align: left;
}


/* ============================================================
   Expanded sequence grid
   ============================================================ */

.sequence-grid {
  display: grid;
  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );
  gap: 13px;
  width: 100%;
}

.sequence-item {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  background: #fff;
  border:
    1px
    solid
    #dedfe2;
  border-top:
    3px
    solid
    var(--example-accent);
  border-radius: 9px;
  box-shadow:
    0
    4px
    14px
    rgba(0, 0, 0, 0.045);
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.sequence-item:hover {
  border-color: var(--example-accent);
  box-shadow:
    0
    7px
    18px
    rgba(0, 0, 0, 0.075);
  transform: translateY(-2px);
}

.sequence-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #fff;
}

.sequence-image {
  display: block;
  width: 100%;
  height: 100%;
  padding: 6px;
  cursor: zoom-in;
  box-sizing: border-box;
}

.sequence-image :deep(.el-image__inner) {
  object-fit: contain;
  transition:
    transform
    0.22s
    ease;
}

.sequence-image:hover :deep(.el-image__inner) {
  transform: scale(1.025);
}


/* ============================================================
   Frame labels
   ============================================================ */

.frame-label {
  position: absolute;
  top: 7px;
  left: 7px;
  z-index: 2;
  padding:
    4px
    7px;
  color: #555;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
  background:
    rgba(
      242,
      242,
      242,
      0.92
    );
  border-radius: 4px;
  backdrop-filter: blur(5px);
}

.frame-label-draft {
  color: #444;
  background:
    rgba(
      235,
      235,
      235,
      0.94
    );
}

.frame-label-final {
  color: #8e2c31;
  background:
    rgba(
      255,
      232,
      233,
      0.94
    );
}

.frame-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  min-height: 35px;
  padding:
    7px
    8px;
  color: #555;
  font-size: 11px;
  font-weight: 600;
  background: #f4f4f4;
  border-top:
    1px
    solid
    #e2e2e2;
  box-sizing: border-box;
}

.frame-index {
  flex-shrink: 0;
  color: #999;
  font-family:
    Consolas,
    Monaco,
    "Courier New",
    monospace;
  font-size: 10px;
}


/* ============================================================
   Example dots
   ============================================================ */

.example-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 18px;
}

.example-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  background: #c8c8c8;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition:
    width 0.18s ease,
    background-color 0.18s ease;
}

.example-dot:hover {
  background: var(--example-accent);
}

.example-dot-active {
  width: 24px;
  background: var(--example-accent);
}

.example-dot:focus-visible {
  outline:
    2px
    solid
    var(--example-accent);
  outline-offset: 2px;
}


/* ============================================================
   Loading and error states
   ============================================================ */

.sequence-state-card {
  width: 100%;
  min-height: 180px;
  padding: 14px;
  background: #f8f8f8;
  border:
    1px
    solid
    #dedfe2;
  border-top:
    3px
    solid
    var(--example-accent);
  border-radius: 9px;
  box-sizing: border-box;
}

.skeleton-grid {
  display: grid;
  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );
  gap: 13px;
}

.skeleton-frame {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 7px;
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c93b40;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
}


/* ============================================================
   Transition
   ============================================================ */

.example-fade-enter-active,
.example-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.example-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.example-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}


/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 991px) {
  .example-arrow-left {
    left: 8px;
  }

  .example-arrow-right {
    right: 8px;
  }

  .sequence-grid,
  .skeleton-grid {
    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 767px) {
  .refine-desc {
    text-align: left;
  }

  .example-arrow {
    width: 36px;
    height: 36px;
    font-size: 17px;
  }

  .sequence-grid,
  .skeleton-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .example-arrow {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .example-heading-row {
    align-items: flex-start;
  }

  .example-heading {
    align-items: center;
    flex-direction: row;
    gap: 8px;
  }

  .sequence-grid,
  .skeleton-grid {
    grid-template-columns:
      minmax(0, 1fr);
  }
}

</style>
