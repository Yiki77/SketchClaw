<script setup lang="ts">

import {
  computed,
  ref
} from 'vue'

import {
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'


// ============================================================
// Types
// ============================================================

interface LayoutExample {
  id: number
  caption: string
  images: string[]
}


// ============================================================
// Captions
// ============================================================

const captions: string[] = [

  'A camel crosses the desert oasis. Palm trees surround the water. A small tent stands beside the pond.',

  'A submarine travels beneath the ocean. Coral reefs grow around the seabed.',

  'A robot steps into the open museum hall. Paintings line the walls. A marble statue stands in the center.',

  'A fox walking through the forest.',

  'Two pandas sit beside a bamboo forest. A small wooden cabin stands nearby, with fallen bamboo leaves covering the ground.',

  'A coral reef teems with colorful fish, with a sea turtle gliding gracefully overhead through crystal-clear water.',

  'A staggered city skyline of spires, domes, and clock towers; street trees and lampposts line the foreground, and flocks of birds fly in the sky.',

  'A massive old banyan tree, its aerial roots drooping, sits beneath a stone table and several stone benches.',

  'A space station is located at the center, with several satellites orbiting in a single shared orbital ring.',

  'A flock of flamingos gathers around a lake, with hills stretching into the distance.',

  'A dog runs through a park. A ball lies near the dog, with a bench standing under a tree nearby.',

  'A penguin stands on a frozen lake. Ice rocks surround the penguin, with snowy mountains rising in the distance.'

]


// ============================================================
// Data
// ============================================================

const allExamples: LayoutExample[] =
  captions.map(
    (
      caption,
      index
    ) => {

      const id = index + 1

      return {

        id,

        caption,

        images: Array.from(
          {
            length: 4
          },
          (
            _,
            imageIndex
          ) =>
            `/layouts/${id}/${imageIndex + 1}.jpg`
        )

      }

    }
  )


const sameExamples =
  allExamples.slice(0, 6)


const differentExamples =
  allExamples.slice(6, 12)


// ============================================================
// Independent carousel state
// ============================================================

const sameIndex = ref(0)

const differentIndex = ref(0)


const currentSameExample =
  computed(() =>
    sameExamples[sameIndex.value]
  )


const currentDifferentExample =
  computed(() =>
    differentExamples[differentIndex.value]
  )


// ============================================================
// Navigation
// ============================================================

const previousSame = () => {

  sameIndex.value =
    (
      sameIndex.value
      - 1
      + sameExamples.length
    )
    % sameExamples.length

}


const nextSame = () => {

  sameIndex.value =
    (
      sameIndex.value + 1
    )
    % sameExamples.length

}


const previousDifferent = () => {

  differentIndex.value =
    (
      differentIndex.value
      - 1
      + differentExamples.length
    )
    % differentExamples.length

}


const nextDifferent = () => {

  differentIndex.value =
    (
      differentIndex.value + 1
    )
    % differentExamples.length

}


const handleSameKeydown = (
  event: KeyboardEvent
) => {

  if (event.key === 'ArrowLeft') {

    event.preventDefault()
    previousSame()

  }

  if (event.key === 'ArrowRight') {

    event.preventDefault()
    nextSame()

  }

}


const handleDifferentKeydown = (
  event: KeyboardEvent
) => {

  if (event.key === 'ArrowLeft') {

    event.preventDefault()
    previousDifferent()

  }

  if (event.key === 'ArrowRight') {

    event.preventDefault()
    nextDifferent()

  }

}

</script>


<template>
  <div class="layouts-section">
    <el-divider />

    <!-- Main highlight -->
    <el-row justify="center">
      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >
        <section class="layout-highlight">
          <div class="layout-kicker" aria-hidden="true">
            <span class="layout-kicker-colors">
              <i class="layout-kicker-color layout-kicker-orange" />
              <i class="layout-kicker-color layout-kicker-yellow" />
              <i class="layout-kicker-color layout-kicker-green" />
              <i class="layout-kicker-color layout-kicker-purple" />
            </span>
          </div>

          <h1 class="layout-main-title">
            Diverse Layouts
          </h1>

          <p class="layout-main-description">
            We demonstrate the scene layout generation capability of SketchClaw by producing diverse compositions for the same textual description.   
          </p>

          <div
            class="layout-feature-chips"
            aria-label="Layout generation capabilities"
          >
            <span class="layout-chip layout-chip-orange">
              Same Objects
            </span>

            <span class="layout-chip layout-chip-purple">
              Different Objects
            </span>
          </div>
        </section>
      </el-col>
    </el-row>

    <!-- Stacked independent galleries -->
    <el-row justify="center">
      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >
        <div class="stacked-layout-gallery">
          <!-- Same Objects -->
          <section
            class="layout-group same-panel"
            tabindex="0"
            aria-label="Same Objects layout examples"
            @keydown="handleSameKeydown"
          >
            <div class="section-heading">
              <h2 class="section-heading-label">
                Diverse layouts with the same objects
              </h2>

              <span class="section-heading-line" />
            </div>

            <div class="example-content">
              <div class="example-caption-area">
                <div class="example-heading-row">
                  <span class="example-label">
                    Example {{ currentSameExample.id }}
                  </span>

                  <span class="example-progress">
                    {{ String(sameIndex + 1).padStart(2, '0') }}
                    /
                    {{ String(sameExamples.length).padStart(2, '0') }}
                  </span>
                </div>

                <p class="example-caption">
                  “{{ currentSameExample.caption }}”
                </p>
              </div>

              <div class="image-navigation">
              <button
                type="button"
                class="nav-arrow"
                aria-label="Previous Same Objects example"
                @click="previousSame"
              >
                <el-icon>
                  <ArrowLeft />
                </el-icon>
              </button>

              <div class="image-row-viewport">
                <div class="image-row">
                  <figure
                    v-for="(imageUrl, imageIndex) in currentSameExample.images"
                    :key="`same-${currentSameExample.id}-${imageIndex}`"
                    class="layout-figure"
                  >
                    <el-image
                      :src="imageUrl"
                      :preview-src-list="currentSameExample.images"
                      :initial-index="imageIndex"
                      :alt="`Same Objects example ${currentSameExample.id}, layout ${imageIndex + 1}`"
                      class="layout-image"
                      fit="contain"
                      preview-teleported
                    >
                      <template #error>
                        <div class="image-error">
                          Unable to load
                        </div>
                      </template>
                    </el-image>

                    <figcaption class="image-label">
                      Layout {{ imageIndex + 1 }}
                    </figcaption>
                  </figure>
                </div>
              </div>

              <button
                type="button"
                class="nav-arrow"
                aria-label="Next Same Objects example"
                @click="nextSame"
              >
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </button>
            </div>

              <div class="example-dots">
                <button
                  v-for="(example, index) in sameExamples"
                  :key="`same-dot-${example.id}`"
                  type="button"
                  class="example-dot"
                  :class="{
                    'example-dot-active': index === sameIndex
                  }"
                  :aria-label="`Show Same Objects example ${index + 1}`"
                  @click="sameIndex = index"
                />
              </div>
            </div>
          </section>

          <!-- Different Configurations -->
          <section
            class="layout-group different-panel"
            tabindex="0"
            aria-label="Different Configurations layout examples"
            @keydown="handleDifferentKeydown"
          >
            <div class="section-heading">
              <h2 class="section-heading-label">
                Diverse layouts with the different objects
              </h2>

              <span class="section-heading-line" />
            </div>

            <div class="example-content">
              <div class="example-caption-area">
                <div class="example-heading-row">
                  <span class="example-label">
                    Example {{ differentIndex + 1 }}
                  </span>

                  <span class="example-progress">
                    {{ String(differentIndex + 1).padStart(2, '0') }}
                    /
                    {{ String(differentExamples.length).padStart(2, '0') }}
                  </span>
                </div>

                <p class="example-caption">
                  “{{ currentDifferentExample.caption }}”
                </p>
              </div>

              <div class="image-navigation">
              <button
                type="button"
                class="nav-arrow"
                aria-label="Previous Different Configurations example"
                @click="previousDifferent"
              >
                <el-icon>
                  <ArrowLeft />
                </el-icon>
              </button>

              <div class="image-row-viewport">
                <div class="image-row">
                  <figure
                    v-for="(imageUrl, imageIndex) in currentDifferentExample.images"
                    :key="`different-${currentDifferentExample.id}-${imageIndex}`"
                    class="layout-figure"
                  >
                    <el-image
                      :src="imageUrl"
                      :preview-src-list="currentDifferentExample.images"
                      :initial-index="imageIndex"
                      :alt="`Different Configurations example ${currentDifferentExample.id}, layout ${imageIndex + 1}`"
                      class="layout-image"
                      fit="contain"
                      preview-teleported
                    >
                      <template #error>
                        <div class="image-error">
                          Unable to load
                        </div>
                      </template>
                    </el-image>

                    <figcaption class="image-label">
                      Layout {{ imageIndex + 1 }}
                    </figcaption>
                  </figure>
                </div>
              </div>

              <button
                type="button"
                class="nav-arrow"
                aria-label="Next Different Configurations example"
                @click="nextDifferent"
              >
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </button>
            </div>

              <div class="example-dots">
                <button
                  v-for="(example, index) in differentExamples"
                  :key="`different-dot-${example.id}`"
                  type="button"
                  class="example-dot"
                  :class="{
                    'example-dot-active': index === differentIndex
                  }"
                  :aria-label="`Show Different Configurations example ${index + 1}`"
                  @click="differentIndex = index"
                />
              </div>
            </div>
          </section>
        </div>
      </el-col>
    </el-row>
  </div>
</template>


<style scoped>
/* ============================================================
   Section
   ============================================================ */

.layouts-section {
  width: 100%;
}


/* ============================================================
   Main highlight card
   ============================================================ */

.layout-highlight {
  position: relative;
  width: 100%;
  margin: 0 0 30px;
  padding: 27px 30px 24px;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      rgba(255, 249, 238, 0.97),
      rgba(248, 252, 244, 0.97) 48%,
      rgba(249, 246, 255, 0.97)
    );
  border: 1px solid #e3e0db;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(35, 35, 35, 0.055);
  box-sizing: border-box;
}

.layout-highlight::after {
  position: absolute;
  right: -72px;
  bottom: -98px;
  width: 225px;
  height: 225px;
  background:
    radial-gradient(
      circle,
      rgba(165, 138, 208, 0.13),
      rgba(165, 138, 208, 0)
    );
  border-radius: 50%;
  pointer-events: none;
  content: '';
}

.layout-kicker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.layout-kicker-colors {
  display: flex;
  align-items: center;
  gap: 7px;
}

.layout-kicker-color {
  display: block;
  width: 29px;
  height: 5px;
  border-radius: 999px;
}

.layout-kicker-orange {
  background: #f39a54;
}

.layout-kicker-yellow {
  background: #e9c957;
}

.layout-kicker-green {
  background: #85bd74;
}

.layout-kicker-purple {
  background: #a58ad0;
}

.layout-main-title {
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  color: #222;
  font-size: 32px;
  font-weight: 750;
  line-height: 1.3;
  text-align: left;
}

.layout-main-description {
  position: relative;
  z-index: 1;
  max-width: 850px;
  margin: 0 0 18px;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.7;
  text-align: justify;
}

.layout-feature-chips {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}

.layout-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 5px 11px;
  color: #303030;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.2;
  border: 1px solid transparent;
  border-radius: 999px;
  box-sizing: border-box;
  white-space: nowrap;
}

.layout-chip-orange {
  background: #fff0e5;
  border-color: #f3b17f;
}

.layout-chip-green {
  background: #eaf7ed;
  border-color: #9dccaa;
}

.layout-chip-purple {
  background: #f1ecfb;
  border-color: #b7a2df;
}


/* ============================================================
   Stacked gallery
   ============================================================ */

.stacked-layout-gallery {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  margin: 4px 0 50px;
}


/* ============================================================
   Layout groups
   ============================================================ */

.layout-group {
  --panel-accent: #ffc862c4;
  --panel-accent-soft: rgba(255, 200, 98, 0.16);
  --panel-accent-text: #8a640f;

  position: relative;
  width: 100%;
  box-sizing: border-box;
  outline: none;
}

.same-panel,
.different-panel {
  --panel-accent: #ffc862c4;
  --panel-accent-soft: rgba(255, 200, 98, 0.16);
}


/* ============================================================
   Unified subsection headings
   Same style as Overview in How_work.vue
   ============================================================ */

.section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin:
    0
    0
    18px;
}

.section-heading-label {
  flex-shrink: 0;
  margin: 0;
  padding:
    6px
    13px;
  color: #222;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  background:
    linear-gradient(
      90deg,
      #fff0e5,
      #fff8d8,
      #eaf7ed,
      #f1ecfb
    );
  border-radius: 999px;
}

.section-heading-line {
  width: 100%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      #d9d9d9,
      rgba(217, 217, 217, 0)
    );
}


/* ============================================================
   Open example area (not enclosed by the section card)
   ============================================================ */

.example-content {
  position: relative;
  width: 100%;
  padding: 0;
  box-sizing: border-box;
}


/* ============================================================
   Caption area
   ============================================================ */

.example-caption-area {
  position: relative;
  z-index: 1;
  margin-bottom: 0;
}

.example-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 6px;
}

.example-label {
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

.example-label::before {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background: var(--panel-accent);
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--panel-accent-soft);
  content: '';
}

.example-progress {
  flex-shrink: 0;
  padding: 5px 9px;
  color: var(--panel-accent-text);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.2;
  background: var(--panel-accent-soft);
  border: 1px solid var(--panel-accent);
  border-radius: 999px;
}

.example-caption {
  min-height: 0;
  margin: 0 0 8px;
  color: #222;
  font-family: inherit;
  font-size: 15px;
  font-style: italic;
  font-weight: 400;
  line-height: 1.65;
  text-align: left;
}


/* ============================================================
   Image navigation
   ============================================================ */

.image-navigation {
  position: relative;
  z-index: 1;
  width: 100%;
}

.nav-arrow {
  position: absolute;
  top: 50%;
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
  border: 1px solid #d4d6da;
  border-radius: 50%;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.nav-arrow:hover {
  color: #8a6215;
  background: var(--panel-accent-soft);
  border-color: var(--panel-accent);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.12);
  transform:
    translateY(-50%)
    scale(1.05);
}

.nav-arrow:active {
  transform:
    translateY(-50%)
    scale(0.95);
}

.nav-arrow:focus-visible {
  outline: 2px solid var(--panel-accent);
  outline-offset: 3px;
}

.nav-arrow:first-child {
  left: -58px;
}

.nav-arrow:last-child {
  right: -58px;
}


/* ============================================================
   Four images in one row
   ============================================================ */

.image-row-viewport {
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.image-row-viewport::-webkit-scrollbar {
  height: 5px;
}

.image-row-viewport::-webkit-scrollbar-thumb {
  background: #cecece;
  border-radius: 999px;
}

.image-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.layout-figure {
  position: relative;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  background: #fafafa;
  border: 1px solid #e1e2e5;
  border-radius: 9px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.035);
}

.layout-figure::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
  height: 3px;
  background: var(--panel-accent);
  pointer-events: none;
  content: '';
}

.layout-image {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #fff;
  cursor: zoom-in;
}

.layout-image :deep(.el-image__inner) {
  display: block;
  width: 100%;
  height: 100%;
  padding: 5px;
  box-sizing: border-box;
  transition: transform 0.2s ease;
}

.layout-figure:hover .layout-image :deep(.el-image__inner) {
  transform: scale(1.02);
}

.image-label {
  padding: 7px 4px;
  overflow: hidden;
  color: #676767;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.25;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #f4f4f4;
  border-top: 1px solid #e2e2e2;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 8px;
  color: #999;
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  background: #f7f7f7;
  box-sizing: border-box;
}


/* ============================================================
   Dots
   ============================================================ */

.example-dots {
  position: relative;
  z-index: 1;
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
  background: #cecece;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition:
    width 0.18s ease,
    background-color 0.18s ease;
}

.example-dot:hover {
  background: var(--panel-accent);
}

.example-dot-active {
  width: 24px;
  background: var(--panel-accent);
}

.example-dot:focus-visible {
  outline: 2px solid var(--panel-accent);
  outline-offset: 3px;
}


/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 767px) {
  .layout-highlight {
    padding: 23px 18px 21px;
  }

  .layout-main-title {
    font-size: 27px;
  }

  .layout-main-description {
    font-size: 17px;
    text-align: left;
  }

  .layout-feature-chips {
    justify-content: flex-start;
  }

  .section-heading {
    gap: 10px;
    margin-bottom: 16px;
  }

  .section-heading-label {
    padding:
      5px
      11px;
    font-size: 21px;
  }

  .example-label,
  .example-caption {
    font-size: 15px;
  }

  .example-heading-row {
    gap: 10px;
    margin-bottom: 5px;
  }

  .example-progress {
    padding: 4px 8px;
    font-size: 11px;
  }

  .example-caption {
    min-height: 0;
    margin-bottom: 7px;
  }

  .nav-arrow {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .nav-arrow:first-child {
    left: 8px;
  }

  .nav-arrow:last-child {
    right: 8px;
  }

  .image-row {
    min-width: 660px;
  }
}
</style>
