<script lang="ts" setup>

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref
} from 'vue'

import {
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'


interface ReasoningProps {
  embedded?: boolean
  showTitle?: boolean
}


withDefaults(
  defineProps<ReasoningProps>(),
  {
    embedded: false,
    showTitle: true
  }
)


// ============================================================
// Types
// ============================================================

interface ExampleConfig {
  id: string
  title: string
  caption: string
  folder: string
}


interface ReasoningStep {
  step: number
  image: string
  imageName: string
  code: string
}


interface ReasoningExample extends ExampleConfig {
  steps: ReasoningStep[]
  currentStep: number
  loading: boolean
  error: string
}


// ============================================================
// Example configuration
// ============================================================

/*
  文件结构：

  public/
  └── layout_process/
      ├── layout1/
      │   ├── step_001.jpg
      │   ├── step_002.jpg
      │   ├── step_003.jpg
      │   └── operations.txt
      ├── layout2/
      └── layout3/

  operations.txt 推荐格式：

  step_001.jpg	initial_layout()
  step_002.jpg	layer(floor, 'bg')
  step_003.jpg	scale(floor, 0.75)
*/

const exampleConfigs: ExampleConfig[] = [

  {
    id: 'layout1',

    title: 'Example 1',

    caption:
      'A bakery displays fresh loaves in the window, with a counter of pastries inside, a large oven behind, flour sacks in the corner, and a sign hanging above the door.',

    folder:
      './layout_process/layout1'
  },


  {
    id: 'layout2',

    title: 'Example 2',

    caption:
      'A giant robot walking through a city street.',

    folder:
      './layout_process/layout2'
  },


  {
    id: 'layout3',

    title: 'Example 3',

    caption:
      'A painter stands before an easel. A paint box lies on the ground, with several brushes inside it.',

    folder:
      './layout_process/layout3'
  },


  {
    id: 'layout4',

    title: 'Example 4',

    caption:
      'A street vendor stands behind a food cart. A parasol shades the cart, with two trash bins beside it.',

    folder:
      './layout_process/layout4'
  },


  {
    id: 'layout5',

    title: 'Example 5',

    caption:
      'A taxi is parked beside a fire hydrant. A mailbox stands on the sidewalk nearby.',

    folder:
      './layout_process/layout5'
  }

]


// ============================================================
// Playback settings
// ============================================================

/*
  每个推理步骤之间的播放间隔。

  例如：
  700  = 0.7 秒
  1000 = 1 秒
*/

const PLAYBACK_INTERVAL = 850


// ============================================================
// State
// ============================================================

const examples = reactive<ReasoningExample[]>(

  exampleConfigs.map((config) => ({

    ...config,

    steps: [],

    currentStep: 0,

    loading: true,

    error: ''

  }))

)


const activeExampleIndex =
  ref(0)


const activeExample =
  computed(() => {

    return examples[
      activeExampleIndex.value
    ]

  })


const isPlaying =
  ref(false)


let playbackTimer:
  number | null = null


const programPanelRefs =
  new Map<
    string,
    HTMLElement
  >()


// ============================================================
// Program panel reference
// ============================================================

const setProgramPanelRef = (
  exampleId: string,
  element: unknown
) => {

  if (
    element instanceof HTMLElement
  ) {

    programPanelRefs.set(
      exampleId,
      element
    )

  } else {

    programPanelRefs.delete(
      exampleId
    )

  }

}


// ============================================================
// Parse operations.txt
// ============================================================

const parseOperations = (
  text: string,
  folder: string
): ReasoningStep[] => {

  const lines =
    text
      .split(/\r?\n/)
      .map((line) => {

        return line.trim()

      })
      .filter((line) => {

        return line.length > 0

      })


  return lines.map(
    (
      line,
      index
    ) => {

      let imageName = ''

      let code = ''


      // 格式一：文件名与代码之间使用 Tab

      const tabIndex =
        line.indexOf('\t')


      if (
        tabIndex >= 0
      ) {

        imageName =
          line
            .slice(
              0,
              tabIndex
            )
            .trim()


        code =
          line
            .slice(
              tabIndex + 1
            )
            .trim()

      } else {

        // 格式二：文件名与代码之间使用空格

        const imageCodeMatch =
          line.match(
            /^(\S+\.(?:jpg|jpeg|jpg|webp))\s+(.+)$/i
          )


        if (
          imageCodeMatch
        ) {

          imageName =
            imageCodeMatch[1]

          code =
            imageCodeMatch[2]

        } else {

          // 格式三：每一行只有代码，自动推断图片名

          imageName =
            `step_${String(index + 1).padStart(3, '0')}.jpg`

          code =
            line

        }

      }


      return {

        step:
          index + 1,

        imageName,

        image:
          `${folder}/${imageName}`,

        code

      }

    }
  )

}


// ============================================================
// Load example
// ============================================================

const loadExample = async (
  example: ReasoningExample
) => {

  example.loading =
    true

  example.error =
    ''


  try {

    const response =
      await fetch(
        `${example.folder}/operations.txt`
      )


    if (
      !response.ok
    ) {

      throw new Error(
        `Unable to load ${example.folder}/operations.txt`
      )

    }


    const text =
      await response.text()


    example.steps =
      parseOperations(
        text,
        example.folder
      )


    if (
      example.steps.length === 0
    ) {

      throw new Error(
        'No reasoning steps were found.'
      )

    }


    example.currentStep =
      0

  } catch (error) {

    example.error =
      error instanceof Error
        ? error.message
        : 'Failed to load the reasoning example.'

  } finally {

    example.loading =
      false

  }

}


// ============================================================
// Current step
// ============================================================

const getCurrentStep = (
  example: ReasoningExample
): ReasoningStep | undefined => {

  return example.steps[
    example.currentStep
  ]

}


// ============================================================
// Scroll current code into view
// ============================================================

const scrollToCurrentCode = async (
  example: ReasoningExample,
  smooth = true
) => {

  await nextTick()


  const panel =
    programPanelRefs.get(
      example.id
    )


  if (!panel) {

    return

  }


  const currentLine =
    panel.querySelector(
      `[data-code-index="${example.currentStep}"]`
    ) as HTMLElement | null


  if (!currentLine) {

    return

  }


  const targetTop =

    currentLine.offsetTop

    - panel.clientHeight / 2

    + currentLine.clientHeight / 2


  panel.scrollTo({

    top:
      Math.max(
        0,
        targetTop
      ),

    behavior:
      smooth
        ? 'smooth'
        : 'auto'

  })

}


// ============================================================
// Playback
// ============================================================

const stopPlayback = () => {

  isPlaying.value =
    false


  if (
    playbackTimer === null
  ) {

    return

  }


  window.clearInterval(
    playbackTimer
  )


  playbackTimer =
    null

}


const advancePlayback = () => {

  const example =
    activeExample.value


  if (
    !example
    || example.loading
    || Boolean(example.error)
    || example.steps.length === 0
  ) {

    stopPlayback()

    return

  }


  const finalStepIndex =
    example.steps.length - 1


  if (
    example.currentStep >= finalStepIndex
  ) {

    stopPlayback()

    return

  }


  example.currentStep +=
    1


  scrollToCurrentCode(
    example
  )


  /*
    到达最后一步后停止播放，
    但保留最后一步画面。
  */

  if (
    example.currentStep >= finalStepIndex
  ) {

    stopPlayback()

  }

}


const startPlayback = async () => {

  const example =
    activeExample.value


  if (
    !example
    || example.loading
    || Boolean(example.error)
    || example.steps.length === 0
  ) {

    return

  }


  if (
    playbackTimer !== null
  ) {

    return

  }


  const finalStepIndex =
    example.steps.length - 1


  /*
    如果已经停留在最后一步，
    再次播放时从第一步重新开始。
  */

  if (
    example.currentStep >= finalStepIndex
  ) {

    example.currentStep =
      0


    await scrollToCurrentCode(
      example,
      false
    )

  }


  isPlaying.value =
    true


  playbackTimer =
    window.setInterval(
      advancePlayback,
      PLAYBACK_INTERVAL
    )

}


const togglePlayback = () => {

  if (
    isPlaying.value
  ) {

    stopPlayback()

  } else {

    startPlayback()

  }

}


// ============================================================
// Step interaction
// ============================================================

const handleStepChange = (
  example: ReasoningExample,
  value: number | number[]
) => {

  stopPlayback()


  const nextStep =
    Array.isArray(value)
      ? value[0]
      : value


  example.currentStep =
    Number(nextStep)


  scrollToCurrentCode(
    example
  )

}


const selectStep = (
  example: ReasoningExample,
  stepIndex: number
) => {

  stopPlayback()


  example.currentStep =
    stepIndex


  scrollToCurrentCode(
    example
  )

}


// ============================================================
// Example navigation
// ============================================================

const showPreviousExample = async () => {

  stopPlayback()


  if (
    examples.length <= 1
  ) {

    return

  }


  activeExampleIndex.value =

    (
      activeExampleIndex.value
      - 1
      + examples.length
    )

    % examples.length


  await nextTick()


  scrollToCurrentCode(
    activeExample.value,
    false
  )

}


const showNextExample = async () => {

  stopPlayback()


  if (
    examples.length <= 1
  ) {

    return

  }


  activeExampleIndex.value =

    (
      activeExampleIndex.value
      + 1
    )

    % examples.length


  await nextTick()


  scrollToCurrentCode(
    activeExample.value,
    false
  )

}


// ============================================================
// Initial loading
// ============================================================

onMounted(async () => {

  await Promise.all(

    examples.map((example) => {

      return loadExample(
        example
      )

    })

  )


  await nextTick()


  scrollToCurrentCode(
    activeExample.value,
    false
  )

})


onBeforeUnmount(() => {

  stopPlayback()

})

</script>


<template>

  <div
    :class="{
      'reasoning-embedded': embedded
    }"
  >


    <!-- 独立显示时才出现分割线 -->

    <el-divider
      v-if="!embedded"
    />


    <el-row
      v-if="embedded && showTitle"
      justify="center"
    >

      <h2 class="section-title method-subtitle reasoning-title">

        Layout Reasoning Process

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
        <!-- Reasoning image -->
        <img
          src="/reasoning.jpg"
          alt="Agentic reasoning overview"
          class="reasoning-image"
        />

        <p class="reasoning-desc">
          
          We visualize the agentic reasoning process of SketchClaw. Starting from independently generated draft assets and a randomly initialized layout, the reasoning agent generates a sequence of executable programs to progressively organize the objects into a coherent scene sketch composition. 
 
          This step provides a basic and reasonable scene layout for the subsequent refinement process to enhance object details and scene-level consistency, resulting in a more detailed sketch.
        </p>

      </el-col>

    </el-row>


    <!-- ================================================== -->
    <!-- Interactive reasoning carousel -->
    <!-- ================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div class="reasoning-carousel">


          <!-- Previous example -->

          <button
            type="button"
            class="example-arrow example-arrow-left"
            aria-label="Previous example"
            :disabled="examples.length <= 1"
            @click="showPreviousExample"
          >

            <el-icon>
              <ArrowLeft />
            </el-icon>

          </button>


          <!-- ================================================== -->
          <!-- Active example -->
          <!-- ================================================== -->

          <div class="example-wrapper">


            <!-- Example counter -->

            <div class="example-meta">

              <span class="example-name">

                {{ activeExample.title }}

              </span>


              <span class="example-counter">

                {{
                  String(activeExampleIndex + 1)
                    .padStart(2, '0')
                }}

                /

                {{
                  String(examples.length)
                    .padStart(2, '0')
                }}

              </span>

            </div>


            <!-- Scene caption -->

            <p class="scene-caption">

              “{{ activeExample.caption }}”

            </p>


            <!-- Loading -->

            <div
              v-if="activeExample.loading"
              class="reasoning-card example-state"
            >

              <el-skeleton
                animated
                :rows="7"
              />

            </div>


            <!-- Error -->

            <div
              v-else-if="activeExample.error"
              class="reasoning-card example-state error-state"
            >

              <p>
                {{ activeExample.error }}
              </p>

            </div>


            <!-- Loaded example -->

            <div
              v-else
              class="reasoning-card"
            >


              <!-- Main viewer -->

              <div class="viewer-container">


                <!-- ====================================== -->
                <!-- Program panel -->
                <!-- ====================================== -->

                <div class="program-panel">


                  <div class="program-title">

                    Executable Program

                  </div>


                  <div
                    :ref="
                      (element) =>
                        setProgramPanelRef(
                          activeExample.id,
                          element
                        )
                    "
                    class="program-list"
                  >


                    <button
                      v-for="(step, codeIndex) in activeExample.steps"
                      :key="`${activeExample.id}-code-${codeIndex}`"
                      type="button"
                      :data-code-index="codeIndex"
                      class="program-line"
                      :class="{
                        'program-line-active':
                          codeIndex === activeExample.currentStep
                      }"
                      @click="
                        selectStep(
                          activeExample,
                          codeIndex
                        )
                      "
                    >


                      <span class="program-index">

                        {{
                          String(codeIndex + 1)
                            .padStart(2, '0')
                        }}

                      </span>


                      <code class="program-code">

                        {{ step.code }}

                      </code>


                    </button>


                  </div>

                </div>


                <!-- ====================================== -->
                <!-- Rendered image -->
                <!-- ====================================== -->

                <div class="result-panel">


                  <img
                    v-if="getCurrentStep(activeExample)"
                    :src="getCurrentStep(activeExample)?.image"
                    :alt="
                      `${activeExample.title}, step ${
                        activeExample.currentStep + 1
                      }`
                    "
                    class="result-image"
                  />


                </div>


              </div>


              <!-- ======================================== -->
              <!-- Playback and progress -->
              <!-- ======================================== -->

              <div class="progress-container">


                <div class="progress-info">


                  <!-- Left side: play button and operation -->

                  <div class="progress-left">


                    <button
                      type="button"
                      class="reasoning-play-button"
                      :class="{
                        'reasoning-play-button-active':
                          isPlaying
                      }"
                      :aria-label="
                        isPlaying
                          ? 'Pause reasoning playback'
                          : 'Play reasoning process'
                      "
                      :title="
                        isPlaying
                          ? 'Pause'
                          : 'Play'
                      "
                      @click="togglePlayback"
                    >


                      <span
                        v-if="isPlaying"
                        class="reasoning-pause-icon"
                        aria-hidden="true"
                      >

                        Ⅱ

                      </span>


                      <span
                        v-else
                        class="reasoning-play-icon"
                        aria-hidden="true"
                      >

                        ▶

                      </span>


                    </button>


                    <span class="current-operation">

                      {{
                        getCurrentStep(activeExample)?.code
                      }}

                    </span>


                  </div>


                  <!-- Right side: step counter -->

                  <span class="step-indicator">

                    STEP

                    {{
                      String(activeExample.currentStep + 1)
                        .padStart(2, '0')
                    }}

                    /

                    {{
                      String(activeExample.steps.length)
                        .padStart(2, '0')
                    }}

                  </span>


                </div>


                <el-slider
                  :model-value="activeExample.currentStep"
                  :min="0"
                  :max="
                    Math.max(
                      0,
                      activeExample.steps.length - 1
                    )
                  "
                  :step="1"
                  :show-tooltip="false"
                  class="reasoning-slider"
                  @input="
                    (value) =>
                      handleStepChange(
                        activeExample,
                        value
                      )
                  "
                />


              </div>


            </div>


          </div>


          <!-- Next example -->

          <button
            type="button"
            class="example-arrow example-arrow-right"
            aria-label="Next example"
            :disabled="examples.length <= 1"
            @click="showNextExample"
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
   Introduction
   ============================================================ */

.reasoning-desc {
  margin-bottom: 28px;

  color: #000;

  font-size: 18px;

  line-height: 1.8;

  text-align: justify;
}


/* ============================================================
   Carousel
   ============================================================ */

.reasoning-carousel {
  --example-accent: #ffc862c4;
  --example-accent-soft: rgba(255, 200, 98, 0.18);

  position: relative;

  width: 100%;

  margin-top: 14px;

  margin-bottom: 45px;
}


.example-wrapper {
  width: 100%;
}


/* ============================================================
   Example navigation arrows
   ============================================================ */

.example-arrow {
  position: absolute;

  top: 53%;

  z-index: 5;

  display: flex;

  align-items: center;

  justify-content: center;

  width: 40px;

  height: 40px;

  padding: 0;

  color: #555;

  font-size: 21px;

  background: #fff;

  border:
    1px
    solid
    #d4d6da;

  border-radius: 50%;

  box-shadow:
    0
    3px
    12px
    rgba(0, 0, 0, 0.08);

  cursor: pointer;

  transform:
    translateY(-50%);

  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}


.example-arrow:hover:not(:disabled) {
  color: #6f551d;

  background: var(--example-accent-soft);

  border-color: var(--example-accent);

  box-shadow:
    0
    5px
    16px
    rgba(0, 0, 0, 0.12);

  transform:
    translateY(-50%)
    scale(1.05);
}


.example-arrow:focus-visible {
  outline:
    2px
    solid
    var(--example-accent);

  outline-offset: 3px;
}


.example-arrow:disabled {
  cursor: default;

  opacity: 0.35;
}


.example-arrow-left {
  left: -58px;
}


.example-arrow-right {
  right: -58px;
}


/* ============================================================
   Example heading and caption
   ============================================================ */

.example-meta {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 18px;

  margin-bottom: 8px;
}


.example-name {
  display: inline-flex;

  align-items: center;

  gap: 8px;

  color: #252525;

  font-size: 18px;

  font-weight: 600;
}


.example-name::before {
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


.example-counter {
  flex-shrink: 0;

  padding:
    5px
    9px;

  color: #6f551d;

  font-size: 12px;

  font-weight: 600;

  letter-spacing: 0.04em;

  background: var(--example-accent-soft);

  border:
    1px
    solid
    var(--example-accent);

  border-radius: 999px;
}


.scene-caption {
  margin:
    0
    0
    8px;

  color: #222;

  font-size: 15px;

  font-style: italic;

  line-height: 1.65;

  text-align: left;
}


/* ============================================================
   Card
   ============================================================ */

.reasoning-card {
  width: 100%;

  padding: 16px;

  overflow: hidden;

  background: #fff;

  border:
    1px
    solid
    #dfe1e5;

  border-top:
    4px
    solid
    var(--example-accent);

  border-radius: 11px;

  box-sizing: border-box;

  box-shadow:
    0
    5px
    18px
    rgba(0, 0, 0, 0.045);
}


/* ============================================================
   Viewer
   ============================================================ */

.viewer-container {
  display: grid;

  grid-template-columns:
    minmax(0, 0.72fr)
    minmax(0, 1.28fr);

  gap: 13px;

  height: 470px;
}


/* ============================================================
   Program panel
   ============================================================ */

.program-panel {
  display: flex;

  flex-direction: column;

  min-width: 0;

  min-height: 0;

  overflow: hidden;

  background: #f2f2f2;

  border:
    1px
    solid
    #d8d8d8;

  border-radius: 8px;
}


.program-title {
  flex-shrink: 0;

  padding:
    13px
    14px;

  color: #707070;

  font-size: 11px;

  font-weight: 600;

  letter-spacing: 0.045em;

  line-height: 1.2;

  text-transform: uppercase;

  border-bottom:
    1px
    solid
    #d7d7d7;
}


.program-list {
  position: relative;

  flex: 1;

  min-height: 0;

  overflow-x: hidden;

  overflow-y: auto;

  padding:
    9px
    0;

  scroll-behavior: smooth;

  scrollbar-color:
    #b7b7b7
    transparent;

  scrollbar-width: thin;
}


.program-list::-webkit-scrollbar {
  width: 6px;
}


.program-list::-webkit-scrollbar-track {
  background: transparent;
}


.program-list::-webkit-scrollbar-thumb {
  background: #b7b7b7;

  border-radius: 10px;
}


/* ============================================================
   Program operation
   ============================================================ */

.program-line {
  display: grid;

  grid-template-columns:
    29px
    minmax(0, 1fr);

  gap: 5px;

  align-items: start;

  width:
    calc(100% - 12px);

  margin:
    2px
    6px;

  padding:
    8px
    7px;

  color: #303030;

  text-align: left;

  background: transparent;

  border: 0;

  border-left:
    3px
    solid
    transparent;

  border-radius: 5px;

  box-sizing: border-box;

  cursor: pointer;

  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease;
}


.program-line:hover {
  background: #e8e8e8;
}


.program-line-active {
  color: #c92f35;

  background: #ffe8e9;

  border-left-color: #c92f35;
}


.program-line-active:hover {
  background: #ffe2e4;
}


.program-index {
  padding-top: 2px;

  color: #9e9e9e;

  font-family:
    Consolas,
    Monaco,
    "Courier New",
    monospace;

  font-size: 11px;

  line-height: 1.5;

  user-select: none;
}


.program-line-active
.program-index {
  color: #c92f35;
}


.program-code {
  min-width: 0;

  overflow-wrap: anywhere;

  color: inherit;

  font-family:
    Consolas,
    Monaco,
    "Courier New",
    monospace;

  font-size: 15px;

  line-height: 1.5;

  white-space: normal;
}


/* ============================================================
   Image panel
   ============================================================ */

.result-panel {
  display: flex;

  align-items: center;

  justify-content: center;

  min-width: 0;

  min-height: 0;

  overflow: hidden;

  background: #fff;

  border:
    1.5px
    solid
    #252525;

  border-radius: 8px;
}


.result-image {
  display: block;

  width: 100%;

  height: 100%;

  padding: 7px;

  object-fit: contain;

  box-sizing: border-box;
}


/* ============================================================
   Progress
   ============================================================ */

.progress-container {
  margin-top: 14px;

  padding:
    0
    2px;
}


.progress-info {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 14px;

  min-height: 34px;

  margin-bottom: 4px;
}


/* ============================================================
   Left playback area
   ============================================================ */

.progress-left {
  display: flex;

  align-items: center;

  flex: 1;

  min-width: 0;

  gap: 10px;
}


/* ============================================================
   Play button
   ============================================================ */

.reasoning-play-button {
  position: relative;

  z-index: 2;

  display: flex;

  align-items: center;

  justify-content: center;

  flex:
    0
    0
    auto;

  width: 30px;

  height: 30px;

  padding: 0;

  color: #444;

  background: #fff;

  border:
    1px
    solid
    #b8babf;

  border-radius: 50%;

  box-shadow:
    0
    2px
    7px
    rgba(0, 0, 0, 0.08);

  cursor: pointer;

  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}


.reasoning-play-button:hover {
  color: #111;

  background: #f4f4f4;

  border-color: #777;

  box-shadow:
    0
    4px
    11px
    rgba(0, 0, 0, 0.13);

  transform:
    scale(1.06);
}


.reasoning-play-button-active {
  color: #fff;

  background: #3f3f3f;

  border-color: #3f3f3f;
}


.reasoning-play-button-active:hover {
  color: #fff;

  background: #222;

  border-color: #222;
}


.reasoning-play-icon {
  display: block;

  margin-left: 2px;

  font-size: 13px;

  line-height: 1;
}


.reasoning-pause-icon {
  display: block;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  font-size: 11px;

  font-weight: 700;

  line-height: 1;
}


/* ============================================================
   Current operation
   ============================================================ */

.current-operation {
  flex: 1;

  min-width: 0;

  overflow: hidden;

  color: #777;

  font-family:
    Consolas,
    Monaco,
    "Courier New",
    monospace;

  font-size: 11px;

  line-height: 1.35;

  text-overflow: ellipsis;

  white-space: nowrap;
}


.step-indicator {
  flex-shrink: 0;

  color: #383838;

  font-size: 11px;

  font-weight: 600;

  letter-spacing: 0.035em;

  white-space: nowrap;
}


/* ============================================================
   Element Plus slider
   ============================================================ */

.reasoning-slider {
  --el-slider-main-bg-color:
    #3b3b3b;

  --el-slider-runway-bg-color:
    #dedede;

  --el-slider-stop-bg-color:
    #dedede;

  padding:
    0
    2px;
}


.reasoning-slider
:deep(.el-slider__runway) {
  height: 5px;

  margin:
    11px
    0;
}


.reasoning-slider
:deep(.el-slider__bar) {
  height: 5px;
}


.reasoning-slider
:deep(.el-slider__button-wrapper) {
  top: -15px;
}


.reasoning-slider
:deep(.el-slider__button) {
  width: 13px;

  height: 13px;

  background: #fff;

  border:
    2px
    solid
    #3b3b3b;
}


/* ============================================================
   Loading and error
   ============================================================ */

.example-state {
  min-height: 540px;

  padding: 22px;
}


.error-state {
  display: flex;

  align-items: center;

  justify-content: center;

  color: #c93b40;

  font-size: 13px;

  line-height: 1.6;

  text-align: center;
}


/* ============================================================
   Tablet
   ============================================================ */

@media (max-width: 991px) {

  .viewer-container {
    grid-template-columns:
      minmax(0, 0.8fr)
      minmax(0, 1.2fr);

    height: 430px;
  }


  .example-arrow-left {
    left: 8px;
  }


  .example-arrow-right {
    right: 8px;
  }


  .example-arrow {
    top: 62%;

    background:
      rgba(
        255,
        255,
        255,
        0.92
      );
  }

}


/* ============================================================
   Mobile
   ============================================================ */

@media (max-width: 767px) {

  .reasoning-card {
    padding: 12px;
  }


  .viewer-container {
    grid-template-columns:
      minmax(0, 1fr);

    height: auto;
  }


  .program-panel {
    height: 250px;
  }


  .result-panel {
    aspect-ratio: 1 / 1;
  }


  .example-arrow {
    top: 67%;

    width: 36px;

    height: 36px;

    font-size: 18px;
  }


  .scene-caption {
    padding:
      0
      5px;

    font-size: 15px;
  }


  .reasoning-play-button {
    width: 32px;

    height: 32px;
  }

}


/* ============================================================
   Very narrow mobile
   ============================================================ */

@media (max-width: 480px) {

  .example-meta {
    padding:
      0
      3px;
  }


  .current-operation {
    display: none;
  }


  .program-panel {
    height: 218px;
  }


  .example-arrow {
    top: 69%;
  }


  .progress-left {
    flex: 0 0 auto;
  }

}

.reasoning-image {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 0 22px;
  object-fit: contain;
}
</style>
