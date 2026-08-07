<script setup lang="ts">
import { ref } from 'vue'
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface GalleryExample {
  id: number
  slug: string
  caption: string
}

const galleryExamples: GalleryExample[] = [
  {
    id: 4,
    slug: 'farmer',
    caption: 'A farmer, pitchfork in hand, stands before a barn door, its door wide open, revealing stacks of sacks and farm tools.'
  },
  {
    id: 5,
    slug: 'fisherman',
    caption: 'A fisherman sits on a rock mending his net, a fish basket and oars beside him. Waves ripple across the sea, and another small boat can be seen in the distance.'
  },
  {
    id: 6,
    slug: 'helicopter',
    caption: 'A helicopter landing on a rooftop.'
  },
  {
    id: 7,
    slug: 'motor',
    caption: 'A motorcycle parked outside a shop.'
  },
  {
    id: 8,
    slug: 'newspaper',
    caption: 'A man reading a newspaper on a bench.'
  },
  {
    id: 9,
    slug: 'sheep',
    caption: 'A windmill with four visible blades stands on a low hill. A dirt track curves around the base of the hill. A flock of sheep grazes on the slope, with a single dog sitting near the rear.'
  }
]

const swiperModules = [Navigation, Pagination, Keyboard, Autoplay, A11y]

const hiddenDraftIds = ref<number[]>([])

const isDraftHidden = (exampleId: number) => {
  return hiddenDraftIds.value.includes(exampleId)
}

const hideDraft = (exampleId: number) => {
  if (!isDraftHidden(exampleId)) {
    hiddenDraftIds.value = [
      ...hiddenDraftIds.value,
      exampleId
    ]
  }
}

const showDraft = (exampleId: number) => {
  hiddenDraftIds.value = hiddenDraftIds.value.filter(
    (currentId) => currentId !== exampleId
  )
}

const getExampleNumber = (example: GalleryExample) => {
  return galleryExamples.findIndex(
    (currentExample) => currentExample.id === example.id
  ) + 1
}

const getDetailImage = (example: GalleryExample) => {
  return `/carousel/${example.id}-${example.slug}.jpg`
}

const getDraftImage = (example: GalleryExample) => {
  return `/carousel/${example.id}-${example.slug}_draft.jpg`
}

const getPreviewImages = (example: GalleryExample) => {
  return [
    getDraftImage(example),
    getDetailImage(example)
  ]
}
</script>

<template>
  <section class="gallery-section">
    <el-divider />

    <el-row justify="center">
      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >
        <section class="gallery-highlight">
          <div class="gallery-kicker" aria-hidden="true">
            <span class="gallery-kicker-colors">
              <i class="gallery-kicker-color gallery-kicker-orange" />
              <i class="gallery-kicker-color gallery-kicker-yellow" />
              <i class="gallery-kicker-color gallery-kicker-green" />
              <i class="gallery-kicker-color gallery-kicker-purple" />
            </span>
          </div>

          <h1 class="gallery-main-title">
            Gallery
          </h1>

          <p class="gallery-main-description">
            We present additional scene sketching results across diverse text descriptions. 
          </p>
        </section>
      </el-col>
    </el-row>

    <el-row justify="center">
      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >
        <div class="gallery-carousel-shell">
          <Swiper
            class="gallery-swiper"
            :modules="swiperModules"
            :slides-per-view="1"
            :slides-per-group="1"
            :space-between="14"
            :speed="450"
            :loop="true"
            :autoplay="{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }"
            :grab-cursor="true"
            :watch-overflow="true"
            :keyboard="{
              enabled: true,
              onlyInViewport: true
            }"
            :navigation="true"
            :pagination="{
              clickable: true
            }"
            :breakpoints="{
              560: {
                slidesPerView: 2,
                spaceBetween: 14
              },
              992: {
                slidesPerView: 3,
                spaceBetween: 14
              }
            }"
          >
            <SwiperSlide
              v-for="example in galleryExamples"
              :key="example.id"
              class="gallery-slide"
            >
              <article class="gallery-item">
                <header class="example-caption-area">
                  <span class="example-label">
                    Example {{ getExampleNumber(example) }}
                  </span>

                  <el-tooltip
                    :content="example.caption"
                    placement="top"
                    effect="light"
                    :show-after="250"
                    :hide-after="0"
                    popper-class="gallery-caption-tooltip"
                  >
                    <p
                      class="example-caption"
                      tabindex="0"
                    >
                      “{{ example.caption }}”
                    </p>
                  </el-tooltip>
                </header>

                <div class="gallery-card">
                  <div class="detail-stage">
                    <el-image
                      class="detail-image"
                      :src="getDetailImage(example)"
                      :alt="`Example ${getExampleNumber(example)} detailed result`"
                      :preview-src-list="getPreviewImages(example)"
                      :initial-index="1"
                      fit="contain"
                      preview-teleported
                      hide-on-click-modal
                      loading="lazy"
                    >
                      <template #error>
                        <div class="image-error">
                          Unable to load detail image
                        </div>
                      </template>
                    </el-image>

                    <div
                      v-if="!isDraftHidden(example.id)"
                      class="draft-preview"
                    >
                      <div class="draft-preview-header">
                        <span class="draft-preview-title">
                          Draft
                        </span>

                        <button
                          type="button"
                          class="draft-close-button"
                          :aria-label="`Hide Draft for Example ${getExampleNumber(example)}`"
                          title="Hide Draft"
                          @click.stop="hideDraft(example.id)"
                        >
                          ×
                        </button>
                      </div>

                      <div class="draft-preview-stage">
                        <el-image
                          class="draft-preview-image"
                          :src="getDraftImage(example)"
                          :alt="`Example ${getExampleNumber(example)} draft`"
                          :preview-src-list="getPreviewImages(example)"
                          :initial-index="0"
                          fit="contain"
                          preview-teleported
                          hide-on-click-modal
                          loading="lazy"
                        >
                          <template #error>
                            <div class="draft-error">
                              Draft
                            </div>
                          </template>
                        </el-image>
                      </div>
                    </div>

                    <button
                      v-else
                      type="button"
                      class="draft-show-button"
                      :aria-label="`Show Draft for Example ${getExampleNumber(example)}`"
                      @click.stop="showDraft(example.id)"
                    >
                      Show Draft
                    </button>

                    <span class="detail-label">
                      Detail
                    </span>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          </Swiper>
        </div>
      </el-col>
    </el-row>
  </section>
</template>

<style scoped>
.gallery-section {
  width: 100%;
}

.gallery-highlight {
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

.gallery-highlight::after {
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

.gallery-kicker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.gallery-kicker-colors {
  display: flex;
  align-items: center;
  gap: 7px;
}

.gallery-kicker-color {
  display: block;
  width: 29px;
  height: 5px;
  border-radius: 999px;
}

.gallery-kicker-orange {
  background: #f39a54;
}

.gallery-kicker-yellow {
  background: #e9c957;
}

.gallery-kicker-green {
  background: #85bd74;
}

.gallery-kicker-purple {
  background: #a58ad0;
}

.gallery-main-title {
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  color: #222;
  font-size: 32px;
  font-weight: 750;
  line-height: 1.3;
  text-align: left;
}

.gallery-main-description {
  position: relative;
  z-index: 1;
  max-width: 850px;
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.7;
  text-align: justify;
}

.gallery-carousel-shell {
  --gallery-accent: #ffc862c4;
  --gallery-accent-soft: rgba(255, 200, 98, 0.17);

  position: relative;
  width: 100%;
  margin: 4px 0 50px;
  box-sizing: border-box;
}

.gallery-swiper {
  width: 100%;
  padding: 4px 2px 42px;
  box-sizing: border-box;
}

.gallery-slide {
  height: auto;
  box-sizing: border-box;
}

.gallery-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
}

.gallery-swiper :deep(.swiper-button-prev),
.gallery-swiper :deep(.swiper-button-next) {
  width: 40px;
  height: 40px;
  margin-top: -20px;
  color: #555;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #d4d6da;
  border-radius: 50%;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.09);
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.gallery-swiper :deep(.swiper-button-prev) {
  left: 8px;
}

.gallery-swiper :deep(.swiper-button-next) {
  right: 8px;
}

.gallery-swiper :deep(.swiper-button-prev::after),
.gallery-swiper :deep(.swiper-button-next::after) {
  font-size: 16px;
  font-weight: 700;
}

.gallery-swiper :deep(.swiper-button-prev:hover),
.gallery-swiper :deep(.swiper-button-next:hover) {
  color: #8a6215;
  background: rgba(255, 248, 230, 0.98);
  border-color: var(--gallery-accent);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.13);
  transform: scale(1.05);
}

.gallery-swiper :deep(.swiper-pagination) {
  bottom: 6px !important;
}

.gallery-swiper :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  margin: 0 4px !important;
  background: #c9c9c9;
  opacity: 1;
  transition:
    width 0.18s ease,
    background-color 0.18s ease;
}

.gallery-swiper :deep(.swiper-pagination-bullet-active) {
  width: 24px;
  background: var(--gallery-accent);
  border-radius: 999px;
}

.example-caption-area {
  margin-bottom: 8px;
}

.example-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
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
  background: var(--gallery-accent);
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--gallery-accent-soft);
  content: '';
}

.example-caption {
  display: -webkit-box;
  min-height: 70px;
  margin: 0;
  overflow: hidden;
  color: #222;
  font-family: inherit;
  font-size: 15px;
  font-style: italic;
  font-weight: 400;
  line-height: 1.55;
  text-align: left;
  cursor: help;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.example-caption:focus-visible {
  outline: 2px solid var(--gallery-accent);
  outline-offset: 3px;
  border-radius: 3px;
}

:global(.gallery-caption-tooltip) {
  max-width: 380px;
  padding: 10px 12px;
  color: #333;
  font-size: 14px;
  font-style: italic;
  line-height: 1.6;
}

.gallery-card {
  position: relative;
  width: 100%;
  margin-top: auto;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe1e5;
  border-radius: 9px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.gallery-card::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 80;
  height: 4px;
  background: var(--gallery-accent);
  pointer-events: none;
  content: '';
}

.gallery-card:hover {
  border-color: var(--gallery-accent);
  box-shadow: 0 7px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.detail-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  isolation: isolate;
}

.detail-image {
  display: block;
  width: 100%;
  height: 100%;
  padding: 5px;
  cursor: zoom-in;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  box-sizing: border-box;
}

.detail-image :deep(.el-image__inner) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  opacity: 1 !important;
  transition: transform 0.2s ease;
}

.gallery-card:hover
.detail-image
:deep(.el-image__inner) {
  transform: scale(1.02);
}

.detail-label {
  position: absolute;
  right: 7px;
  bottom: 7px;
  z-index: 30;
  padding: 4px 7px;
  color: #555;
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(244, 244, 244, 0.92);
  border: 1px solid rgba(210, 210, 210, 0.85);
  border-radius: 4px;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

.draft-preview {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 50;
  width: 34%;
  min-width: 72px;
  overflow: hidden;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  isolation: isolate;
  border: 1px solid rgba(205, 207, 211, 0.95);
  border-radius: 6px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
}

.draft-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  min-height: 22px;
  padding: 2px 4px 2px 7px;
  color-scheme: only light;
  forced-color-adjust: none;
  background: rgba(242, 242, 242, 0.98) !important;
  border-bottom: 1px solid #d9d9d9;
  box-sizing: border-box;
}

.draft-preview-title {
  color: #555;
  font-size: 8px;
  font-weight: 650;
  line-height: 1;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.draft-close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  padding: 0;
  color: #777;
  font-family: Arial, sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.draft-close-button:hover {
  color: #333;
  background: #dedede;
}

.draft-close-button:focus-visible,
.draft-show-button:focus-visible {
  outline: 2px solid var(--gallery-accent);
  outline-offset: 2px;
}

.draft-show-button {
  position: absolute;
  top: 9px;
  left: 9px;
  z-index: 50;
  min-height: 25px;
  padding: 4px 8px;
  color: #555;
  font-size: 9px;
  font-weight: 650;
  line-height: 1.2;
  background: rgba(244, 244, 244, 0.92);
  border: 1px solid #d5d5d5;
  border-radius: 5px;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease;
}

.draft-show-button:hover {
  color: #6f551d;
  background: var(--gallery-accent-soft);
  border-color: var(--gallery-accent);
}

.draft-preview-stage {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  isolation: isolate;
}

.draft-preview-image {
  display: block;
  width: 100%;
  height: 100%;
  padding: 2px;
  cursor: zoom-in;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  box-sizing: border-box;
}

.draft-preview-image :deep(.el-image__inner) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  opacity: 1 !important;
}

.image-error,
.draft-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
  line-height: 1.4;
  text-align: center;
  background: #f7f7f7;
  box-sizing: border-box;
}

.image-error {
  padding: 12px;
  font-size: 12px;
}

.draft-error {
  padding: 4px;
  font-size: 8px;
}

@media (max-width: 991px) {
  .gallery-highlight {
    padding: 23px 18px 21px;
  }

  .gallery-main-title {
    font-size: 27px;
  }

  .gallery-main-description {
    font-size: 18px;
    text-align: left;
  }
}

@media (max-width: 559px) {
  .gallery-swiper {
    padding-right: 8px;
    padding-left: 8px;
  }

  .gallery-swiper :deep(.swiper-button-prev),
  .gallery-swiper :deep(.swiper-button-next) {
    width: 36px;
    height: 36px;
  }

  .gallery-swiper :deep(.swiper-button-prev) {
    left: 12px;
  }

  .gallery-swiper :deep(.swiper-button-next) {
    right: 12px;
  }

  .example-caption {
    min-height: auto;
    font-size: 18px;
    -webkit-line-clamp: initial;
  }

  .example-label {
    font-size: 18px;
  }
}

:global(.el-image-viewer__wrapper),
:global(.el-image-viewer__canvas) {
  color-scheme: only light;
  forced-color-adjust: none;
}

:global(.el-image-viewer__img) {
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  opacity: 1 !important;
}

:global(html.dark .detail-image img),
:global(html.dark .draft-preview-image img),
:global(body.dark .detail-image img),
:global(body.dark .draft-preview-image img),
:global([data-theme='dark'] .detail-image img),
:global([data-theme='dark'] .draft-preview-image img) {
  background: #fff !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  opacity: 1 !important;
}

:global(.gallery-caption-tooltip.el-popper) {
  color-scheme: only light;
  forced-color-adjust: none;
  color: #333 !important;
  background: #fff !important;
  border-color: #d8d8d8 !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.12) !important;
}

:global(
  .gallery-caption-tooltip.el-popper
  .el-popper__arrow::before
) {
  background: #fff !important;
  border-color: #d8d8d8 !important;
}
</style>
