<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const baseUrl = import.meta.env.BASE_URL

interface ComparisonImage {
  label: string
  src: string
}

interface ComparisonGroup {
  id: number
  prompt: string
  images: ComparisonImage[]
}

/* ============================================================
   Quantitative tables
   ============================================================ */

const backboneRows = [
  {
    method: 'Gemini-3.1-pro',
    sem: '0.858',
    comp: '0.723',
    compl: '0.723',
    aes: '0.819',
    size: '0.707',
    iter: '5.332',
    ver: '0.535',
    best: false,
  },
  {
    method: 'Claude-Opus-4-7',
    sem: '0.879',
    comp: '0.681',
    compl: '0.791',
    aes: '0.739',
    size: '0.721',
    iter: '5.843',
    ver: '0.477',
    best: false,
  },
  {
    method: 'Qwen3.7-Plus',
    sem: '0.629',
    comp: '0.477',
    compl: '0.526',
    aes: '0.552',
    size: '0.507',
    iter: '10.743',
    ver: '0.436',
    best: false,
  },
  {
    method: 'OpenAI GPT-5.5',
    sem: '0.926',
    comp: '0.795',
    compl: '0.811',
    aes: '0.871',
    size: '0.785',
    iter: '1.656',
    ver: '0.803',
    best: true,
  },
]

const reasoningRows = [
  {
    method: 'w/o Plan',
    sem: '0.680',
    comp: '0.507',
    compl: '0.573',
    aes: '0.648',
    size: '0.472',
    iter: '12.375',
    ver: '0.357',
    best: false,
  },
  {
    method: 'w/o Geo. Ver.',
    sem: '0.700',
    comp: '0.553',
    compl: '0.570',
    aes: '0.658',
    size: '0.589',
    iter: '1.857',
    ver: '0.633',
    best: false,
  },
  {
    method: 'w/o Sem. Ver.',
    sem: '0.606',
    comp: '0.515',
    compl: '0.647',
    aes: '0.576',
    size: '0.550',
    iter: '1.438',
    ver: '0.468',
    best: false,
  },
  {
    method: 'w/o Short Mem.',
    sem: '0.740',
    comp: '0.661',
    compl: '0.607',
    aes: '0.677',
    size: '0.687',
    iter: '2.875',
    ver: '0.635',
    best: false,
  },
  {
    method: 'w/o Long Mem.',
    sem: '0.747',
    comp: '0.697',
    compl: '0.615',
    aes: '0.713',
    size: '0.677',
    iter: '1.600',
    ver: '0.650',
    best: false,
  },
  {
    method: 'SketchClaw',
    sem: '0.817',
    comp: '0.769',
    compl: '0.707',
    aes: '0.738',
    size: '0.733',
    iter: '1.375',
    ver: '0.873',
    best: true,
  },
]

/* ============================================================
   VLM backbone examples
   ============================================================ */

const backboneMethods = [
  { key: 'gpt', label: 'OpenAI GPT-5.5' },
  { key: 'gemini', label: 'Gemini-3.1-pro' },
  { key: 'claude', label: 'Claude-Opus-4-7' },
  { key: 'qwen', label: 'Qwen3.7-Plus' },
]

const backbonePrompts = [
  'A fox walking through the forest.',
  'A painter stands before an easel. A paint box lies on the ground, with several brushes inside it.',
  'A farmer, pitchfork in hand, stands before a barn door, its door wide open, revealing stacks of sacks and farm tools.',
  'A billboard stands on a city rooftop, with skyscrapers rising behind it and traffic flowing on the street below.',
]

const backboneGroups: ComparisonGroup[] = backbonePrompts.map((prompt, index) => ({
  id: index + 1,
  prompt,
  images: backboneMethods.map((method) => ({
    label: method.label,
    src: `${baseUrl}backbones/${index + 1}-${method.key}.jpg`,
  })),
}))

/* ============================================================
   Agentic reasoning examples
   ============================================================ */

const reasoningMethods = [
  { key: 'plan', label: 'w/o Plan' },
  { key: 'geo', label: 'w/o Geo. Ver.' },
  { key: 'sem', label: 'w/o Sem. Ver.' },
  { key: 'short', label: 'w/o Short Merm.' },
  { key: 'long', label: 'w/o Long Merm.' },
  { key: 'sketchclaw', label: 'SketchClaw' },
]

const reasoningPrompts = [
  'A bird sits on a tree branch. A small nest rests beside it, with leaves and flowers surrounding the tree.',
  'A drone flies through a futuristic city. Hovering vehicles move between skyscrapers.',
  'A monkey swings on a jungle vine. Large trees surround the monkey, with a waterfall flowing between the rocks.',
  'A diver explores an underwater cave. Coral reefs cover the rocks, with schools of fish swimming overhead.',
]

const reasoningGroups: ComparisonGroup[] = reasoningPrompts.map((prompt, index) => ({
  id: index + 1,
  prompt,
  images: reasoningMethods.map((method) => ({
    label: method.label,
    src: `${baseUrl}reasoning/${index + 1}-${method.key}.jpg`,
  })),
}))

/* ============================================================
   Contour resampling examples
   ============================================================ */

const resamplingPrompts = [
  'The bus stopped at the stop.',
  'A lighthouse stands beside rocks, with a sailboat in the distance.',
  'A shop with potted flowers and a bicycle in the front yard.',
  'A clothesline hangs on a tree on the left and on the eaves on the right, with several pieces of clothing, including skirts and pants, hanging on it.',
]

const resamplingGroups: ComparisonGroup[] = resamplingPrompts.map((prompt, index) => ({
  id: index + 1,
  prompt,
  images: [
    {
      label: 'Point-based Resampling',
      src: `${baseUrl}resampling/${index + 1}-point.jpg`,
    },
    {
      label: 'Point-based Result',
      src: `${baseUrl}resampling/${index + 1}-point-result.jpg`,
    },
    {
      label: 'Contour Resampling',
      src: `${baseUrl}resampling/${index + 1}-curve.jpg`,
    },
    {
      label: 'Contour Result',
      src: `${baseUrl}resampling/${index + 1}-curve-result.jpg`,
    },
  ],
}))

/* ============================================================
   Joint optimization examples
   ============================================================ */

const optimizationPrompts = [
  'A woman planting flowers in a backyard garden.',
  'A man walking his dog along a beach.',
  'An old tower standing among ancient ruins.',
  'A bridge in front a mountain connects two small villages across a valley.',
]

const optimizationGroups: ComparisonGroup[] = optimizationPrompts.map((prompt, index) => ({
  id: index + 1,
  prompt,
  images: [
    {
      label: 'Draft',
      src: `${baseUrl}optimization/${index + 1}-draft.jpg`,
    },
    {
      label: 'SketchClaw',
      src: `${baseUrl}optimization/${index + 1}-sketchclaw.jpg`,
    },
    {
      label: 'w/o Local',
      src: `${baseUrl}optimization/${index + 1}-local.jpg`,
    },
    {
      label: 'w/o Global',
      src: `${baseUrl}optimization/${index + 1}-global.jpg`,
    },
    {
      label: 'w/o Progressive',
      src: `${baseUrl}optimization/${index + 1}-progressive.jpg`,
    },
  ],
}))

/* ============================================================
   Independent carousel state
   ============================================================ */

const backboneIndex = ref(0)
const reasoningIndex = ref(0)
const resamplingIndex = ref(0)
const optimizationIndex = ref(0)

const currentBackbone = computed(() => backboneGroups[backboneIndex.value])
const currentReasoning = computed(() => reasoningGroups[reasoningIndex.value])
const currentResampling = computed(() => resamplingGroups[resamplingIndex.value])
const currentOptimization = computed(() => optimizationGroups[optimizationIndex.value])

const previousBackbone = () => {
  backboneIndex.value =
    (backboneIndex.value - 1 + backboneGroups.length) % backboneGroups.length
}

const nextBackbone = () => {
  backboneIndex.value =
    (backboneIndex.value + 1) % backboneGroups.length
}

const previousReasoning = () => {
  reasoningIndex.value =
    (reasoningIndex.value - 1 + reasoningGroups.length) % reasoningGroups.length
}

const nextReasoning = () => {
  reasoningIndex.value =
    (reasoningIndex.value + 1) % reasoningGroups.length
}

const previousResampling = () => {
  resamplingIndex.value =
    (resamplingIndex.value - 1 + resamplingGroups.length) % resamplingGroups.length
}

const nextResampling = () => {
  resamplingIndex.value =
    (resamplingIndex.value + 1) % resamplingGroups.length
}

const previousOptimization = () => {
  optimizationIndex.value =
    (optimizationIndex.value - 1 + optimizationGroups.length) % optimizationGroups.length
}

const nextOptimization = () => {
  optimizationIndex.value =
    (optimizationIndex.value + 1) % optimizationGroups.length
}

const handleKeydown = (
  event: KeyboardEvent,
  previous: () => void,
  next: () => void,
) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previous()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
  }
}
</script>

<template>
  <div class="ablation-layout-section">
    <el-divider />

    <!-- ================================================== -->
    <!-- Main highlight -->
    <!-- ================================================== -->
    <el-row justify="center">
      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >
        <section class="ablation-highlight">
          <div class="ablation-kicker" aria-hidden="true">
            <span class="ablation-kicker-colors">
              <i class="ablation-kicker-color kicker-orange" />
              <i class="ablation-kicker-color kicker-yellow" />
              <i class="ablation-kicker-color kicker-green" />
              <i class="ablation-kicker-color kicker-purple" />
            </span>
          </div>

          <h1 class="ablation-main-title">
            Ablation Study
          </h1>

          <p class="ablation-main-description">
            We systematically analyze the contribution of key components in
            SketchClaw.
          </p>

          <div
            class="ablation-feature-chips"
            aria-label="Ablation categories"
          >
            <span class="ablation-chip chip-orange">
              VLM Backbones
            </span>
            <span class="ablation-chip chip-yellow">
              Agentic Reasoning
            </span>
            <span class="ablation-chip chip-green">
              Contour Resampling
            </span>
            <span class="ablation-chip chip-purple">
              Joint Optimization
            </span>
          </div>
        </section>
      </el-col>
    </el-row>

    <!-- ================================================== -->
    <!-- Main content -->
    <!-- ================================================== -->
    <el-row justify="center">
      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >
        <div class="ablation-stack">

          <!-- ================================================== -->
          <!-- VLM Backbones -->
          <!-- ================================================== -->
          <section class="ablation-group backbone-panel">
            <div class="section-heading">
              <h2 class="section-heading-label">
                Impact of VLM Backbones
              </h2>
              <span class="section-heading-line" />
            </div>

            <div class="result-area">
              <div class="minor-title">
                VLM Backbone Ablation
              </div>

              <div class="table-scroll">
                <table class="ablation-table">
                  <thead>
                    <tr>
                      <th class="method-col">Method</th>
                      <th>Sem. ↑</th>
                      <th>Comp. ↑</th>
                      <th>Compl. ↑</th>
                      <th>Aes. ↑</th>
                      <th>Size ↑</th>
                      <th>Iter. ↓</th>
                      <th>Ver. ↑</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="row in backboneRows"
                      :key="row.method"
                      :class="{ 'best-row': row.best }"
                    >
                      <td class="method-col">{{ row.method }}</td>
                      <td>{{ row.sem }}</td>
                      <td>{{ row.comp }}</td>
                      <td>{{ row.compl }}</td>
                      <td>{{ row.aes }}</td>
                      <td>{{ row.size }}</td>
                      <td>{{ row.iter }}</td>
                      <td>{{ row.ver }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p class="result-caption">
                <strong>Impact of different VLM backbones.</strong>
                We compare the sketch verification quality and convergence
                efficiency of SketchClaw using different VLM backbones.
              </p>
            </div>

            <div class="visual-area">
              <div class="minor-title">
                VLM Backbone Visual Comparison
              </div>

              <div
                class="example-content"
                tabindex="0"
                aria-label="VLM backbone visual comparison"
                @keydown="handleKeydown($event, previousBackbone, nextBackbone)"
              >
                <div class="example-caption-area">
                  <div class="example-heading-row">
                    <span class="example-label">
                      Example {{ currentBackbone.id }}
                    </span>

                    <span class="example-progress">
                      {{ String(backboneIndex + 1).padStart(2, '0') }}
                      /
                      {{ String(backboneGroups.length).padStart(2, '0') }}
                    </span>
                  </div>

                  <p class="example-caption">
                    “{{ currentBackbone.prompt }}”
                  </p>
                </div>

                <div class="image-navigation">
                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Previous VLM backbone example"
                    @click="previousBackbone"
                  >
                    <el-icon><ArrowLeft /></el-icon>
                  </button>

                  <div class="image-row-viewport">
                    <div class="image-row image-row-4">
                      <figure
                        v-for="(image, imageIndex) in currentBackbone.images"
                        :key="`backbone-${currentBackbone.id}-${image.label}`"
                        class="comparison-figure"
                      >
                        <el-image
                          :src="image.src"
                          :preview-src-list="currentBackbone.images.map(item => item.src)"
                          :initial-index="imageIndex"
                          :alt="`${image.label} result for backbone example ${currentBackbone.id}`"
                          class="comparison-image"
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
                          {{ image.label }}
                        </figcaption>
                      </figure>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Next VLM backbone example"
                    @click="nextBackbone"
                  >
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                </div>

                <div class="example-dots">
                  <button
                    v-for="(group, index) in backboneGroups"
                    :key="`backbone-dot-${group.id}`"
                    type="button"
                    class="example-dot"
                    :class="{ 'example-dot-active': index === backboneIndex }"
                    :aria-label="`Show VLM backbone example ${index + 1}`"
                    @click="backboneIndex = index"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- ================================================== -->
          <!-- Agentic Reasoning -->
          <!-- ================================================== -->
          <section class="ablation-group reasoning-panel">
            <div class="section-heading">
              <h2 class="section-heading-label">
                Impact of Agentic Reasoning
              </h2>
              <span class="section-heading-line" />
            </div>

            <div class="result-area">
              <div class="minor-title">
                Agentic Reasoning Component Ablation
              </div>

              <div class="table-scroll">
                <table class="ablation-table">
                  <thead>
                    <tr>
                      <th class="method-col">Method</th>
                      <th>Sem. ↑</th>
                      <th>Comp. ↑</th>
                      <th>Compl. ↑</th>
                      <th>Aes. ↑</th>
                      <th>Size ↑</th>
                      <th>Iter. ↓</th>
                      <th>Ver. ↑</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="row in reasoningRows"
                      :key="row.method"
                      :class="{ 'best-row': row.best }"
                    >
                      <td class="method-col">{{ row.method }}</td>
                      <td>{{ row.sem }}</td>
                      <td>{{ row.comp }}</td>
                      <td>{{ row.compl }}</td>
                      <td>{{ row.aes }}</td>
                      <td>{{ row.size }}</td>
                      <td>{{ row.iter }}</td>
                      <td>{{ row.ver }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="visual-area">
              <div class="minor-title">
                Agentic Reasoning Ablation Examples
              </div>

              <div
                class="example-content"
                tabindex="0"
                aria-label="Agentic reasoning ablation examples"
                @keydown="handleKeydown($event, previousReasoning, nextReasoning)"
              >
                <div class="example-caption-area">
                  <div class="example-heading-row">
                    <span class="example-label">
                      Example {{ currentReasoning.id }}
                    </span>

                    <span class="example-progress">
                      {{ String(reasoningIndex + 1).padStart(2, '0') }}
                      /
                      {{ String(reasoningGroups.length).padStart(2, '0') }}
                    </span>
                  </div>

                  <p class="example-caption">
                    “{{ currentReasoning.prompt }}”
                  </p>
                </div>

                <div class="image-navigation">
                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Previous reasoning example"
                    @click="previousReasoning"
                  >
                    <el-icon><ArrowLeft /></el-icon>
                  </button>

                  <div class="image-row-viewport">
                    <div class="image-row image-row-6">
                      <figure
                        v-for="(image, imageIndex) in currentReasoning.images"
                        :key="`reasoning-${currentReasoning.id}-${image.label}`"
                        class="comparison-figure"
                      >
                        <el-image
                          :src="image.src"
                          :preview-src-list="currentReasoning.images.map(item => item.src)"
                          :initial-index="imageIndex"
                          :alt="`${image.label} result for reasoning example ${currentReasoning.id}`"
                          class="comparison-image"
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
                          {{ image.label }}
                        </figcaption>
                      </figure>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Next reasoning example"
                    @click="nextReasoning"
                  >
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                </div>

                <div class="example-dots">
                  <button
                    v-for="(group, index) in reasoningGroups"
                    :key="`reasoning-dot-${group.id}`"
                    type="button"
                    class="example-dot"
                    :class="{ 'example-dot-active': index === reasoningIndex }"
                    :aria-label="`Show reasoning example ${index + 1}`"
                    @click="reasoningIndex = index"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- ================================================== -->
          <!-- Structure-aware Refinement -->
          <!-- ================================================== -->
          <section class="ablation-group refinement-panel">
            <div class="section-heading">
              <h2 class="section-heading-label">
                Impact of Structure-aware Refinement
              </h2>
              <span class="section-heading-line" />
            </div>

            <!-- Contour Resampling -->
            <div class="visual-area refinement-visual-area resampling-panel">
              <div class="minor-title">
                Contour Resampling Examples
              </div>

              <div
                class="example-content"
                tabindex="0"
                aria-label="Contour resampling examples"
                @keydown="handleKeydown($event, previousResampling, nextResampling)"
              >
                <div class="example-caption-area">
                  <div class="example-heading-row">
                    <span class="example-label">
                      Example {{ currentResampling.id }}
                    </span>

                    <span class="example-progress">
                      {{ String(resamplingIndex + 1).padStart(2, '0') }}
                      /
                      {{ String(resamplingGroups.length).padStart(2, '0') }}
                    </span>
                  </div>

                  <p class="example-caption">
                    “{{ currentResampling.prompt }}”
                  </p>
                </div>

                <div class="image-navigation">
                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Previous resampling example"
                    @click="previousResampling"
                  >
                    <el-icon><ArrowLeft /></el-icon>
                  </button>

                  <div class="image-row-viewport">
                    <div class="image-row image-row-4">
                      <figure
                        v-for="(image, imageIndex) in currentResampling.images"
                        :key="`resampling-${currentResampling.id}-${image.label}`"
                        class="comparison-figure"
                      >
                        <el-image
                          :src="image.src"
                          :preview-src-list="currentResampling.images.map(item => item.src)"
                          :initial-index="imageIndex"
                          :alt="`${image.label} for resampling example ${currentResampling.id}`"
                          class="comparison-image"
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
                          {{ image.label }}
                        </figcaption>
                      </figure>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Next resampling example"
                    @click="nextResampling"
                  >
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                </div>

                <div class="example-dots">
                  <button
                    v-for="(group, index) in resamplingGroups"
                    :key="`resampling-dot-${group.id}`"
                    type="button"
                    class="example-dot"
                    :class="{ 'example-dot-active': index === resamplingIndex }"
                    :aria-label="`Show resampling example ${index + 1}`"
                    @click="resamplingIndex = index"
                  />
                </div>
              </div>
            </div>

            <!-- Joint Optimization -->
            <div class="visual-area refinement-visual-area optimization-panel">
              <div class="minor-title">
                Joint Optimization Examples
              </div>

              <div
                class="example-content"
                tabindex="0"
                aria-label="Joint optimization examples"
                @keydown="handleKeydown($event, previousOptimization, nextOptimization)"
              >
                <div class="example-caption-area">
                  <div class="example-heading-row">
                    <span class="example-label">
                      Example {{ currentOptimization.id }}
                    </span>

                    <span class="example-progress">
                      {{ String(optimizationIndex + 1).padStart(2, '0') }}
                      /
                      {{ String(optimizationGroups.length).padStart(2, '0') }}
                    </span>
                  </div>

                  <p class="example-caption">
                    “{{ currentOptimization.prompt }}”
                  </p>
                </div>

                <div class="image-navigation">
                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Previous optimization example"
                    @click="previousOptimization"
                  >
                    <el-icon><ArrowLeft /></el-icon>
                  </button>

                  <div class="image-row-viewport">
                    <div class="image-row image-row-5">
                      <figure
                        v-for="(image, imageIndex) in currentOptimization.images"
                        :key="`optimization-${currentOptimization.id}-${image.label}`"
                        class="comparison-figure"
                      >
                        <el-image
                          :src="image.src"
                          :preview-src-list="currentOptimization.images.map(item => item.src)"
                          :initial-index="imageIndex"
                          :alt="`${image.label} result for optimization example ${currentOptimization.id}`"
                          class="comparison-image"
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
                          {{ image.label }}
                        </figcaption>
                      </figure>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="nav-arrow"
                    aria-label="Next optimization example"
                    @click="nextOptimization"
                  >
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                </div>

                <div class="example-dots">
                  <button
                    v-for="(group, index) in optimizationGroups"
                    :key="`optimization-dot-${group.id}`"
                    type="button"
                    class="example-dot"
                    :class="{ 'example-dot-active': index === optimizationIndex }"
                    :aria-label="`Show optimization example ${index + 1}`"
                    @click="optimizationIndex = index"
                  />
                </div>
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

.ablation-layout-section {
  width: 100%;
}

/* ============================================================
   Main highlight — aligned with layouts.vue
   ============================================================ */

.ablation-highlight {
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

.ablation-highlight::after {
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

.ablation-kicker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.ablation-kicker-colors {
  display: flex;
  align-items: center;
  gap: 7px;
}

.ablation-kicker-color {
  display: block;
  width: 29px;
  height: 5px;
  border-radius: 999px;
}

.kicker-orange {
  background: #f39a54;
}

.kicker-yellow {
  background: #e9c957;
}

.kicker-green {
  background: #85bd74;
}

.kicker-purple {
  background: #a58ad0;
}

.ablation-main-title {
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  color: #222;
  font-size: 32px;
  font-weight: 750;
  line-height: 1.3;
  text-align: left;
}

.ablation-main-description {
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

.ablation-feature-chips {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}

.ablation-chip {
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

.chip-orange {
  background: #fff0e5;
  border-color: #f3b17f;
}

.chip-yellow {
  background: #fff8d8;
  border-color: #e5cf71;
}

.chip-green {
  background: #eaf7ed;
  border-color: #9dccaa;
}

.chip-purple {
  background: #f1ecfb;
  border-color: #b7a2df;
}

/* ============================================================
   Stacked sections
   ============================================================ */

.ablation-stack {
  display: flex;
  flex-direction: column;
  gap: 34px;
  width: 100%;
  margin: 4px 0 50px;
}

.ablation-group {
  --panel-accent: #ffc862c4;
  --panel-accent-soft: rgba(255, 200, 98, 0.16);
  --panel-accent-text: #8a640f;

  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.backbone-panel {
  --panel-accent: #f3b17f;
  --panel-accent-soft: rgba(243, 177, 127, 0.16);
  --panel-accent-text: #8b5428;
}

.reasoning-panel {
  --panel-accent: #e5cf71;
  --panel-accent-soft: rgba(229, 207, 113, 0.18);
  --panel-accent-text: #78651d;
}

.refinement-panel {
  --panel-accent: #9dccaa;
  --panel-accent-soft: rgba(157, 204, 170, 0.17);
  --panel-accent-text: #477655;
}

.resampling-panel {
  --panel-accent: #9dccaa;
  --panel-accent-soft: rgba(157, 204, 170, 0.17);
  --panel-accent-text: #477655;
}

.optimization-panel {
  --panel-accent: #b7a2df;
  --panel-accent-soft: rgba(183, 162, 223, 0.17);
  --panel-accent-text: #66518e;
}

/* ============================================================
   Section heading — same visual language as layouts.vue
   ============================================================ */

.section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin: 0 0 18px;
}

.section-heading-label {
  flex-shrink: 0;
  margin: 0;
  padding: 6px 13px;
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
   Minor headings
   ============================================================ */

.minor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 11px;
  color: #2d2d2d;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.4;
}

.minor-title::before {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  background: var(--panel-accent);
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--panel-accent-soft);
  content: '';
}

.result-area {
  width: 100%;
  margin-bottom: 25px;
}

.visual-area {
  width: 100%;
}

.refinement-visual-area + .refinement-visual-area {
  margin-top: 30px;
  padding-top: 28px;
  border-top: 1px solid #ececeb;
}

/* ============================================================
   Tables
   ============================================================ */

.table-scroll {
  width: 100%;
  overflow-x: auto;
  background: #fff;
  border: 1px solid #dedfe2;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.035);
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.ablation-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  color: #353535;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.ablation-table th,
.ablation-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #ececea;
  white-space: nowrap;
}

.ablation-table thead th {
  color: #333;
  font-size: 12px;
  font-weight: 760;
  background: #fafaf8;
  border-bottom: 1px solid #cfcfcb;
}

.ablation-table tbody tr:last-child td {
  border-bottom: 0;
}

.ablation-table tbody tr:hover {
  background: #fbfaf7;
}

.ablation-table .method-col {
  min-width: 145px;
  padding-left: 14px;
  text-align: left;
}

.ablation-table .best-row {
  font-weight: 760;
  background: var(--panel-accent-soft);
}

.result-caption {
  margin: 9px 3px 0;
  color: #666;
  font-size: 12px;
  line-height: 1.6;
  text-align: left;
}

.result-caption strong {
  color: #444;
  font-weight: 700;
}

/* ============================================================
   Open example area — follows layouts.vue
   ============================================================ */

.example-content {
  position: relative;
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  outline: none;
}

.example-content:focus-visible {
  border-radius: 10px;
  outline: 2px solid var(--panel-accent);
  outline-offset: 5px;
}

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
  font-size: 15px;
  font-style: italic;
  font-weight: 400;
  line-height: 1.65;
  text-align: left;
}

/* ============================================================
   Navigation
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
  color: var(--panel-accent-text);
  background: var(--panel-accent-soft);
  border-color: var(--panel-accent);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-50%) scale(1.05);
}

.nav-arrow:active {
  transform: translateY(-50%) scale(0.95);
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
   Image rows
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
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.image-row-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.image-row-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.image-row-6 {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.comparison-figure {
  position: relative;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  background: #fafafa;
  border: 1px solid #e1e2e5;
  border-radius: 9px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.035);
}

.comparison-figure::before {
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

.comparison-image {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #fff;
  cursor: zoom-in;
}

.comparison-image :deep(.el-image__inner) {
  display: block;
  width: 100%;
  height: 100%;
  padding: 5px;
  box-sizing: border-box;
  transition: transform 0.2s ease;
}

.comparison-figure:hover .comparison-image :deep(.el-image__inner) {
  transform: scale(1.02);
}

.image-label {
  min-height: 34px;
  padding: 7px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #676767;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.25;
  text-align: center;
  background: #f4f4f4;
  border-top: 1px solid #e2e2e2;
  box-sizing: border-box;
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
  .ablation-highlight {
    padding: 23px 18px 21px;
  }

  .ablation-main-title {
    font-size: 27px;
  }

  .ablation-main-description {
    font-size: 17px;
    text-align: left;
  }

  .ablation-feature-chips {
    justify-content: flex-start;
  }

  .section-heading {
    gap: 10px;
    margin-bottom: 16px;
  }

  .section-heading-label {
    padding: 5px 11px;
    font-size: 18px;
  }

  .minor-title {
    font-size: 15px;
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

  .image-row-4 {
    min-width: 660px;
  }

  .image-row-5 {
    min-width: 820px;
  }

  .image-row-6 {
    min-width: 980px;
  }
}
</style>
