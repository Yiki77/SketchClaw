<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// ============================================================
// Props
// ============================================================

interface ConceptProps {
  embedded?: boolean
  showTitle?: boolean
}

withDefaults(
  defineProps<ConceptProps>(),
  {
    embedded: false,
    showTitle: true
  }
)

// ============================================================
// Types
// ============================================================

interface ConceptAsset {
  id: string
  name: string
  file: string
}

interface ConceptExample {
  id: string
  title: string
  caption: string
  folder: string
  assets: ConceptAsset[]
}

// ============================================================
// Examples
// ============================================================

const examples: ConceptExample[] = [
  {
    id: 'concept1',

    title: 'Example 1',

    caption:
      'A diver explores an underwater cave. Coral reefs cover the rocks, with schools of fish swimming overhead.',

    folder: '/concept/1',

    assets: [
      {
        id: 'cave',
        name: 'Cave',
        file: '/concept/1/cave_bg.jpg'
      },
      {
        id: 'coral_re ef',
        name: 'Coral Reef',
        file: '/concept/1/coral_reef_bg.jpg'
      },
      {
        id: 'diver',
        name: 'Diver',
        file: '/concept/1/diver_bg.jpg'
      },
      {
        id: 'fish_1',
        name: 'Fish 1',
        file: '/concept/1/fish_1_bg.jpg'
      },
      {
        id: 'fish_2',
        name: 'Fish 2',
        file: '/concept/1/fish_2_bg.jpg'
      },
      {
        id: 'fish_3',
        name: 'Fish 3',
        file: '/concept/1/fish_3_bg.jpg'
      },
      {
        id: 'fish_4',
        name: 'Fish 4',
        file: '/concept/1/fish_4_bg.jpg'
      },
      {
        id: 'rock_formation',
        name: 'Rock Formation',
        file: '/concept/1/rock_formation_bg.jpg'
      }
    ]
  },

  {
    id: 'concept2',

    title: 'Example 2',

    caption:
      'A dog sleeping next to a bowl.',

    folder: '/concept/2',

    assets: [
      {
        id: 'bowl',
        name: 'Bowl',
        file: '/concept/2/bowl_bg.jpg'
      },
      {
        id: 'dog',
        name: 'Sleeping Dog',
        file: '/concept/2/dog_bg.jpg'
      },
      {
        id: 'floor',
        name: 'Floor',
        file: '/concept/2/floor_bg.jpg'
      }
    ]
  },

  {
    id: 'concept3',

    title: 'Example 3',

    caption:
      'A drone flies through a futuristic city. Hovering vehicles move between skyscrapers.',

    folder: '/concept/3',

    assets: [
      {
        id: 'drone',
        name: 'Drone',
        file: '/concept/3/drone_bg.jpg'
      },
      {
        id: 'hovering_vehicle_1',
        name: 'Hovering Vehicle 1',
        file: '/concept/3/hovering_vehicle_1_bg.jpg'
      },
      {
        id: 'hovering_vehicle_2',
        name: 'Hovering Vehicle 2',
        file: '/concept/3/hovering_vehicle_2_bg.jpg'
      },
      {
        id: 'skyscraper_1',
        name: 'Skyscraper 1',
        file: '/concept/3/skyscraper_1_bg.jpg'
      },
      {
        id: 'skyscraper_2',
        name: 'Skyscraper 2',
        file: '/concept/3/skyscraper_2_bg.jpg'
      },
      {
        id: 'skyscraper_3',
        name: 'Skyscraper 3',
        file: '/concept/3/skyscraper_3_bg.jpg'
      }
    ]
  }
]

// ============================================================
// Current example
// ============================================================

const activeExampleIndex = ref(0)

const activeExample = computed<ConceptExample>(() => {
  return examples[
    activeExampleIndex.value
  ]
})

// ============================================================
// Navigation
// ============================================================

const showPreviousExample = () => {
  activeExampleIndex.value =
    (
      activeExampleIndex.value
      - 1
      + examples.length
    )
    % examples.length
}

const showNextExample = () => {
  activeExampleIndex.value =
    (
      activeExampleIndex.value
      + 1
    )
    % examples.length
}
</script>


<template>

  <div
    class="concept-section"
    :class="{
      'concept-embedded': embedded
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
        Step 1: Concept Representation
      </h1>

    </el-row>


    <!-- Embedded title -->

    <el-row
      v-if="embedded && showTitle"
      justify="center"
    >

      <h2 class="concept-subtitle">
        Step 1: Concept Representation
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
          src="/concept.jpg"
          alt="Concept representation overview"
          class="concept-image"
        />


        <p class="concept-desc">

          We illustrate how SketchClaw transforms a textual scene description
          into multiple independently editable concept assets, with each concept
          represented as an individual SVG object.
          This step allows the subsequent reasoning process to organize,
          transform, and compose these assets separately on the canvas.

        </p>

      </el-col>

    </el-row>


    <!-- ====================================================== -->
    <!-- Interactive example -->
    <!-- ====================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div class="concept-carousel">


          <!-- Previous example -->

          <button
            type="button"
            class="example-arrow example-arrow-left"
            aria-label="Previous concept example"
            :disabled="examples.length <= 1"
            @click="showPreviousExample"
          >

            <el-icon>
              <ArrowLeft />
            </el-icon>

          </button>


          <!-- Current example -->

          <div class="example-wrapper">


            <!-- Example title + progress -->

            <div class="example-meta">

              <span class="example-title">

                {{ activeExample.title }}

              </span>


              <span class="example-counter">

                {{
                  String(
                    activeExampleIndex + 1
                  ).padStart(
                    2,
                    '0'
                  )
                }}

                /

                {{
                  String(
                    examples.length
                  ).padStart(
                    2,
                    '0'
                  )
                }}

              </span>

            </div>


            <!-- Scene caption -->

            <p class="scene-caption">

              “{{ activeExample.caption }}”

            </p>


            <!-- Asset card -->

            <div class="concept-card">


              <div class="asset-grid">


                <div
                  v-for="(
                    asset,
                    assetIndex
                  ) in activeExample.assets"
                  :key="
                    `${activeExample.id}-${asset.id}`
                  "
                  class="asset-card"
                >


                  <!-- Asset index -->

                  <div class="asset-index">

                    {{
                      String(
                        assetIndex + 1
                      ).padStart(
                        2,
                        '0'
                      )
                    }}

                  </div>


                  <!-- Asset image -->

                  <div class="asset-image-wrapper">

                    <img
                      :src="asset.file"
                      :alt="asset.name"
                      class="asset-image"
                      draggable="false"
                    />

                  </div>


                  <!-- Asset name -->

                  <div class="asset-name">

                    {{ asset.name }}

                  </div>


                  <!-- Asset format -->

                  <div class="asset-format">

                    Independent SVG Asset

                  </div>


                </div>


              </div>


            </div>


          </div>


          <!-- Next example -->

          <button
            type="button"
            class="example-arrow example-arrow-right"
            aria-label="Next concept example"
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
   Section
   ============================================================ */

.concept-section {
  width: 100%;
}


.concept-embedded {
  margin-top: 0;
}


/* ============================================================
   Description
   ============================================================ */

.concept-desc {
  margin-bottom: 28px;

  color: #000;

  font-size: 18px;

  line-height: 1.8;

  text-align: justify;
}


/* ============================================================
   Carousel
   ============================================================ */

.concept-carousel {
  --example-accent: #ffc862c4;
  --example-accent-soft:
    rgba(
      255,
      200,
      98,
      0.14
    );
  --example-accent-text: #8a640f;

  position: relative;

  width: 100%;

  margin:
    10px
    0
    46px;
}


.example-wrapper {
  width: 100%;
}


/* ============================================================
   Example navigation
   ============================================================ */

.example-arrow {
  position: absolute;

  top: 58%;

  z-index: 10;

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
    rgba(
      0,
      0,
      0,
      0.08
    );

  cursor: pointer;

  transform:
    translateY(
      -50%
    );

  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}


.example-arrow:hover:not(:disabled) {

  color:
    var(
      --example-accent-text
    );

  background:
    var(
      --example-accent-soft
    );

  border-color:
    var(
      --example-accent
    );

  box-shadow:
    0
    5px
    16px
    rgba(
      0,
      0,
      0,
      0.12
    );

  transform:
    translateY(
      -50%
    )
    scale(
      1.05
    );
}


.example-arrow:disabled {
  cursor: default;
  opacity: 0.35;
}


.example-arrow:focus-visible {

  outline:
    2px
    solid
    var(
      --example-accent
    );

  outline-offset: 3px;
}


.example-arrow-left {
  left: -58px;
}


.example-arrow-right {
  right: -58px;
}


/* ============================================================
   Example title + progress
   ============================================================ */

.example-meta {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 18px;

  margin-bottom: 7px;
}


.example-title {

  display: inline-flex;

  align-items: center;

  gap: 9px;

  color: #252525;

  font-size: 18px;

  font-weight: 600;
}


.example-title::before {

  flex-shrink: 0;

  width: 8px;

  height: 8px;

  background:
    var(
      --example-accent
    );

  border-radius: 50%;

  box-shadow:
    0
    0
    0
    4px
    var(
      --example-accent-soft
    );

  content: '';
}


/* ============================================================
   Example progress: 01 / 03
   ============================================================ */

.example-counter {

  flex-shrink: 0;

  padding:
    5px
    9px;

  color:
    var(
      --example-accent-text
    );

  font-size: 12px;

  font-weight: 600;

  letter-spacing: 0.04em;

  line-height: 1.2;

  background:
    var(
      --example-accent-soft
    );

  border:
    1px
    solid
    var(
      --example-accent
    );

  border-radius: 999px;
}


/* ============================================================
   Scene caption
   ============================================================ */

/*
  这里是主要修改位置。

  原来：
  min-height: 48px;
  margin: 0 0 0px;

  现在去掉 min-height，
  caption 根据真实文本高度自动撑开，
  与下面卡片只保留 8px。
*/

.scene-caption {

  margin:
    0
    0
    8px;

  color: #222;

  font-size: 15px;

  font-style: italic;

  font-weight: 400;

  line-height: 1.6;

  text-align: left;
}


/* ============================================================
   Main card
   ============================================================ */

.concept-card {

  position: relative;

  width: 100%;

  padding:
    17px
    14px
    14px;

  overflow: hidden;

  color-scheme:
    only light;

  forced-color-adjust:
    none;

  background:
    #f4f4f4
    !important;

  isolation: isolate;

  border:
    1px
    solid
    #dfe1e5;

  border-top:
    4px
    solid
    var(
      --example-accent
    );

  border-radius: 11px;

  box-sizing:
    border-box;

  box-shadow:
    0
    5px
    18px
    rgba(
      0,
      0,
      0,
      0.045
    );
}


/* ============================================================
   Asset grid
   ============================================================ */

.asset-grid {

  display: grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(
        128px,
        1fr
      )
    );

  gap: 11px;

  width: 100%;
}


/* ============================================================
   Asset card
   ============================================================ */

.asset-card {

  position: relative;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  min-width: 0;

  min-height: 185px;

  padding:
    11px
    10px
    10px;

  overflow: hidden;

  color-scheme:
    only light;

  forced-color-adjust:
    none;

  background:
    #fff
    !important;

  isolation: isolate;

  border:
    1px
    solid
    #dedede;

  border-radius: 7px;

  box-sizing:
    border-box;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}


.asset-card:hover {

  border-color:
    var(
      --example-accent
    );

  box-shadow:
    0
    4px
    12px
    rgba(
      0,
      0,
      0,
      0.07
    );

  transform:
    translateY(
      -2px
    );
}


/* ============================================================
   Asset number
   ============================================================ */

.asset-index {

  position: absolute;

  top: 7px;

  left: 8px;

  z-index: 10;

  padding:
    3px
    6px;

  color:
    var(
      --example-accent-text
    );

  font-family:
    Consolas,
    Monaco,
    "Courier New",
    monospace;

  font-size: 9px;

  font-weight: 700;

  line-height: 1.2;

  background:
    var(
      --example-accent-soft
    );

  border:
    1px
    solid
    var(
      --example-accent
    );

  border-radius: 999px;

  isolation: isolate;

  pointer-events: none;
}


/* ============================================================
   Asset image
   ============================================================ */

.asset-image-wrapper {

  position: relative;

  z-index: 1;

  display: flex;

  flex: 1;

  align-items: center;

  justify-content: center;

  width: 100%;

  min-height: 0;

  overflow: hidden;

  color-scheme:
    only light;

  forced-color-adjust:
    none;

  background:
    #fff
    !important;

  isolation: isolate;
}


.asset-image {

  position: relative;

  z-index: 1;

  display: block;

  width: 100%;

  height: 128px;

  object-fit: contain;

  color-scheme:
    only light;

  forced-color-adjust:
    none;

  background:
    transparent
    !important;

  filter:
    none
    !important;

  mix-blend-mode:
    normal
    !important;

  opacity:
    1
    !important;

  pointer-events: none;

  user-select: none;
}


/* ============================================================
   Asset labels
   ============================================================ */

.asset-name {

  width: 100%;

  margin-top: 7px;

  overflow: hidden;

  color: #292929;

  font-size: 12px;

  font-weight: 600;

  line-height: 1.35;

  text-align: center;

  text-overflow: ellipsis;

  white-space: nowrap;
}


.asset-format {

  margin-top: 3px;

  color: #999;

  font-size: 8px;

  letter-spacing:
    0.025em;

  text-transform:
    uppercase;
}


/* ============================================================
   Concept overview image
   ============================================================ */

.concept-image {

  display: block;

  width: 100%;

  height: auto;

  margin:
    0
    0
    22px;

  object-fit:
    contain;

  color-scheme:
    only light;

  forced-color-adjust:
    none;

  background:
    #fff
    !important;

  filter:
    none
    !important;

  mix-blend-mode:
    normal
    !important;

  opacity:
    1
    !important;

  isolation: isolate;
}


/* ============================================================
   Tablet
   ============================================================ */

@media (max-width: 991px) {

  .example-arrow-left {
    left: 8px;
  }


  .example-arrow-right {
    right: 8px;
  }


  .example-arrow {

    background:
      rgba(
        255,
        255,
        255,
        0.94
      );
  }


  .asset-grid {

    grid-template-columns:
      repeat(
        3,
        minmax(
          0,
          1fr
        )
      );
  }

}


/* ============================================================
   Mobile
   ============================================================ */

@media (max-width: 767px) {

  .concept-card {
    padding: 12px;
  }


  .asset-grid {

    grid-template-columns:
      repeat(
        2,
        minmax(
          0,
          1fr
        )
      );
  }


  .scene-caption {

    padding:
      0
      4px;

    font-size: 15px;
  }


  .example-arrow {

    top: 58%;

    width: 36px;

    height: 36px;

    font-size: 18px;
  }

}


/* ============================================================
   Very narrow mobile
   ============================================================ */

@media (max-width: 480px) {

  .asset-grid {

    grid-template-columns:
      minmax(
        0,
        1fr
      );
  }


  .asset-card {
    min-height: 205px;
  }


  .asset-image {
    height: 150px;
  }

}


/* ============================================================
   Dark-mode protection
   ============================================================ */

:global(
  html.dark
  .concept-section
  .concept-image
),

:global(
  body.dark
  .concept-section
  .concept-image
),

:global(
  [data-theme='dark']
  .concept-section
  .concept-image
),

:global(
  .dark
  .concept-section
  .concept-image
) {

  color-scheme:
    only light;

  forced-color-adjust:
    none;

  background:
    #fff
    !important;

  filter:
    none
    !important;

  mix-blend-mode:
    normal
    !important;

  opacity:
    1
    !important;
}


:global(
  html.dark
  .concept-section
  .asset-image
),

:global(
  body.dark
  .concept-section
  .asset-image
),

:global(
  [data-theme='dark']
  .concept-section
  .asset-image
),

:global(
  .dark
  .concept-section
  .asset-image
) {

  color-scheme:
    only light;

  forced-color-adjust:
    none;

  background:
    transparent
    !important;

  filter:
    none
    !important;

  mix-blend-mode:
    normal
    !important;

  opacity:
    1
    !important;
}


:global(
  html.dark
  .concept-section
  .asset-card
),

:global(
  html.dark
  .concept-section
  .asset-image-wrapper
),

:global(
  body.dark
  .concept-section
  .asset-card
),

:global(
  body.dark
  .concept-section
  .asset-image-wrapper
),

:global(
  [data-theme='dark']
  .concept-section
  .asset-card
),

:global(
  [data-theme='dark']
  .concept-section
  .asset-image-wrapper
) {

  color-scheme:
    only light;

  forced-color-adjust:
    none;

  background:
    #fff
    !important;

  filter:
    none
    !important;

  mix-blend-mode:
    normal
    !important;
}


.concept-section img {

  forced-color-adjust:
    none;

  filter:
    none
    !important;

  mix-blend-mode:
    normal
    !important;

  opacity:
    1
    !important;
}

</style>