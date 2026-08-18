<script lang="ts" setup>

import {
  computed,
  ref
} from 'vue'

// ============================================================
// Types
// ============================================================

interface ComparisonRow {
  model: string
  semanticAlignment: string
  spatialComposition: string
  objectCompleteness: string
  visualAesthetics: string
  sizeConsistency: string
}


type EvaluatorKey =
  | 'qwen'
  | 'claude'
  | 'gemini'
  | 'gpt'


type MetricKey =
  | 'semanticAlignment'
  | 'spatialComposition'
  | 'objectCompleteness'
  | 'visualAesthetics'
  | 'sizeConsistency'


// ============================================================
// Evaluator
// ============================================================

const activeTab = ref<EvaluatorKey>('qwen')


// ============================================================
// Qwen3.7-Plus evaluation
// ============================================================

const qwenData: ComparisonRow[] = [

  {
    model: 'VectorFusion',
    semanticAlignment: '0.327',
    spatialComposition: '0.153',
    objectCompleteness: '0.237',
    visualAesthetics: '0.283',
    sizeConsistency: '0.233'
  },

  {
    model: 'SVGDreamer',
    semanticAlignment: '0.717',
    spatialComposition: '0.590',
    objectCompleteness: '0.667',
    visualAesthetics: '0.690',
    sizeConsistency: '0.667'
  },

  {
    model: 'DiffSketcher',
    semanticAlignment: '0.543',
    spatialComposition: '0.367',
    objectCompleteness: '0.400',
    visualAesthetics: '0.550',
    sizeConsistency: '0.443'
  },

  {
    model: 'SketchAgent',
    semanticAlignment: '0.735',
    spatialComposition: '0.633',
    objectCompleteness: '0.630',
    visualAesthetics: '0.720',
    sizeConsistency: '0.647'
  },

  {
    model: 'GPT-5.5',
    semanticAlignment: '0.918',
    spatialComposition: '0.727',
    objectCompleteness: '0.815',
    visualAesthetics: '0.843',
    sizeConsistency: '0.783'
  },

  {
    model: 'SketchClaw',
    semanticAlignment: '0.928',
    spatialComposition: '0.853',
    objectCompleteness: '0.858',
    visualAesthetics: '0.878',
    sizeConsistency: '0.818'
  },

  {
    model: 'SketchClaw (refine)',
    semanticAlignment: '0.936',
    spatialComposition: '0.875',
    objectCompleteness: '0.893',
    visualAesthetics: '0.875',
    sizeConsistency: '0.850'
  }

]


// ============================================================
// Claude-Opus-4-7 evaluation
// ============================================================

const claudeData: ComparisonRow[] = [

  {
    model: 'VectorFusion',
    semanticAlignment: '0.685',
    spatialComposition: '0.510',
    objectCompleteness: '0.543',
    visualAesthetics: '0.637',
    sizeConsistency: '0.633'
  },

  {
    model: 'SVGDreamer',
    semanticAlignment: '0.707',
    spatialComposition: '0.635',
    objectCompleteness: '0.682',
    visualAesthetics: '0.658',
    sizeConsistency: '0.692'
  },

  {
    model: 'DiffSketcher',
    semanticAlignment: '0.677',
    spatialComposition: '0.518',
    objectCompleteness: '0.518',
    visualAesthetics: '0.677',
    sizeConsistency: '0.665'
  },

  {
    model: 'SketchAgent',
    semanticAlignment: '0.735',
    spatialComposition: '0.627',
    objectCompleteness: '0.637',
    visualAesthetics: '0.677',
    sizeConsistency: '0.665'
  },

  {
    model: 'GPT-5.5',
    semanticAlignment: '0.917',
    spatialComposition: '0.763',
    objectCompleteness: '0.823',
    visualAesthetics: '0.850',
    sizeConsistency: '0.780'
  },

  {
    model: 'SketchClaw',
    semanticAlignment: '0.880',
    spatialComposition: '0.700',
    objectCompleteness: '0.785',
    visualAesthetics: '0.752',
    sizeConsistency: '0.727'
  },

  {
    model: 'SketchClaw(refine)',
    semanticAlignment: '0.888',
    spatialComposition: '0.755',
    objectCompleteness: '0.815',
    visualAesthetics: '0.837',
    sizeConsistency: '0.782'
  }

]


// ============================================================
// Gemini3.1-Pro evaluation
// ============================================================

const geminiData: ComparisonRow[] = [

  {
    model: 'VectorFusion',
    semanticAlignment: '0.4033',
    spatialComposition: '0.097',
    objectCompleteness: '0.220',
    visualAesthetics: '0.350',
    sizeConsistency: '0.380'
  },

  {
    model: 'SVGDreamer',
    semanticAlignment: '0.630',
    spatialComposition: '0.383',
    objectCompleteness: '0.490',
    visualAesthetics: '0.623',
    sizeConsistency: '0.767'
  },

  {
    model: 'DiffSketcher',
    semanticAlignment: '0.472',
    spatialComposition: '0.190',
    objectCompleteness: '0.190',
    visualAesthetics: '0.557',
    sizeConsistency: '0.540'
  },

  {
    model: 'SketchAgent',
    semanticAlignment: '0.787',
    spatialComposition: '0.480',
    objectCompleteness: '0.500',
    visualAesthetics: '0.773',
    sizeConsistency: '0.803'
  },

  {
    model: 'GPT-5.5',
    semanticAlignment: '0.954',
    spatialComposition: '0.780',
    objectCompleteness: '0.833',
    visualAesthetics: '0.730',
    sizeConsistency: '0.933'
  },

  {
    model: 'SketchClaw',
    semanticAlignment: '0.959',
    spatialComposition: '0.773',
    objectCompleteness: '0.797',
    visualAesthetics: '0.840',
    sizeConsistency: '0.897'
  },

  {
    model: 'SketchClaw(refine)',
    semanticAlignment: '0.967',
    spatialComposition: '0.737',
    objectCompleteness: '0.863',
    visualAesthetics: '0.907',
    sizeConsistency: '0.950'
  }

]


// ============================================================
// OpenAI GPT-5.5 evaluation
// ============================================================

const gptData: ComparisonRow[] = [

  {
    model: 'VectorFusion',
    semanticAlignment: '0.450',
    spatialComposition: '0.250',
    objectCompleteness: '0.350',
    visualAesthetics: '0.400',
    sizeConsistency: '0.400'
  },

  {
    model: 'SVGDreamer',
    semanticAlignment: '0.706',
    spatialComposition: '0.575',
    objectCompleteness: '0.639',
    visualAesthetics: '0.629',
    sizeConsistency: '0.656'
  },

  {
    model: 'DiffSketcher',
    semanticAlignment: '0.578',
    spatialComposition: '0.419',
    objectCompleteness: '0.416',
    visualAesthetics: '0.529',
    sizeConsistency: '0.531'
  },

  {
    model: 'SketchAgent',
    semanticAlignment: '0.710',
    spatialComposition: '0.652',
    objectCompleteness: '0.588',
    visualAesthetics: '0.687',
    sizeConsistency: '0.658'
  },

  {
    model: 'GPT-5.5',
    semanticAlignment: '0.857',
    spatialComposition: '0.650',
    objectCompleteness: '0.773',
    visualAesthetics: '0.830',
    sizeConsistency: '0.785'
  },

  {
    model: 'SketchClaw',
    semanticAlignment: '0.896',
    spatialComposition: '0.76217',
    objectCompleteness: '0.757',
    visualAesthetics: '0.815',
    sizeConsistency: '0.736'
  },

  {
    model: 'SketchClaw(refine)',
    semanticAlignment: '0.902',
    spatialComposition: '0.781',
    objectCompleteness: '0.802',
    visualAesthetics: '0.856',
    sizeConsistency: '0.784'
  }

]


// ============================================================
// Current table data
// ============================================================

const dataMap: Record<
  EvaluatorKey,
  ComparisonRow[]
> = {

  qwen: qwenData,

  claude: claudeData,

  gemini: geminiData,

  gpt: gptData

}


const currentData = computed<ComparisonRow[]>(() => {

  return dataMap[
    activeTab.value
  ]

})


// ============================================================
// Bold best values
// ============================================================

const isBest = (
  row: ComparisonRow,
  prop: MetricKey
) => {

  if (
    activeTab.value === 'qwen'
    && row.model === 'SketchClaw (refine)'
    && [
      'semanticAlignment',
      'spatialComposition',
      'objectCompleteness',
      'sizeConsistency'
    ].includes(prop)
  ) {

    return true

  }


  if (
    row.model === 'SketchClaw'
    && prop === 'visualAesthetics'
  ) {

    return true

  }


  return false

}

// ============================================================
// Row styling
// ============================================================

const getRowClassName = (
  {
    row
  }: {
    row: ComparisonRow
  }
) => {

  if (
    row.model.toLowerCase().includes(
      'sketchclaw'
    )
  ) {

    return row.model
      .toLowerCase()
      .includes('refine')
      ? 'sketchclaw-refine-row'
      : 'sketchclaw-row'

  }

  return ''

}


</script>


<template>

  <div class="comparison-section">

    <el-divider />

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >
        <!-- ================================================== -->
        <!-- Comparison overview -->
        <!-- ================================================== -->
        <section class="comparison-intro-card">

          <div
            class="comparison-kicker"
            aria-hidden="true"
          >

            <span class="comparison-kicker-bar kicker-orange" />
            <span class="comparison-kicker-bar kicker-yellow" />
            <span class="comparison-kicker-bar kicker-green" />
            <span class="comparison-kicker-bar kicker-purple" />

          </div>


          <h1 class="comparison-card-title">
            Comparison
          </h1>


          <p class="comparison-desc">

            We evaluate SketchClaw through both quantitative and qualitative
            comparisons with existing sketch generation methods.

          </p>


          <div
            class="comparison-scope-tags"
            aria-label="Evaluation types"
          >

            <span class="comparison-scope-tag scope-quantitative">
              Quantitative Comparison
            </span>

            <span class="comparison-scope-tag scope-qualitative">
              Qualitative Comparison
            </span>

            <span class="comparison-scope-tag scope-human">
              Human Evaluation
            </span>

          </div>

        </section>
        <!-- ================================================== -->
        <!-- Quantitative comparison -->
        <!-- ================================================== -->
        <section class="comparison-panel">

          <div class="comparison-section-heading">

            <h2 class="comparison-section-heading-label">
              Quantitative Comparison
            </h2>

            <span class="comparison-section-heading-line" />

          </div>


          <p class="comparison-helper">

            Automatic evaluation across five dimensions using
            multiple vision-language model evaluators.

          </p>


          <div class="comparison-card">
        <!-- Evaluator tabs -->
            <div class="evaluator-header">

              <span class="evaluator-label">
                Evaluator
              </span>

            </div>


            <el-tabs
              v-model="activeTab"
              class="comparison-tabs"
            >

              <el-tab-pane
                label="Qwen3.7-Plus"
                name="qwen"
              />

              <el-tab-pane
                label="Claude-Opus-4-7"
                name="claude"
              />

              <el-tab-pane
                label="Gemini3.1-Pro"
                name="gemini"
              />

              <el-tab-pane
                label="OpenAI GPT-5.5"
                name="gpt"
              />

            </el-tabs>
        <!-- Table -->
            <div class="table-scroll">

              <el-table
                :data="currentData"
                table-layout="fixed"
                class="comparison-table"
                :row-class-name="getRowClassName"
              >

                <el-table-column
                  prop="model"
                  label="Method"
                  width="160"
                />


                <el-table-column
                  prop="semanticAlignment"
                  label="Semantic Alignment ↑"
                  min-width="145"
                  align="center"
                >

                  <template #default="scope">

                    <b
                      v-if="
                        isBest(
                          scope.row,
                          'semanticAlignment'
                        )
                      "
                      class="best-value"
                    >
                      {{ scope.row.semanticAlignment }}
                    </b>

                    <span v-else>
                      {{ scope.row.semanticAlignment }}
                    </span>

                  </template>

                </el-table-column>


                <el-table-column
                  prop="spatialComposition"
                  label="Spatial Composition ↑"
                  min-width="150"
                  align="center"
                >

                  <template #default="scope">

                    <b
                      v-if="
                        isBest(
                          scope.row,
                          'spatialComposition'
                        )
                      "
                      class="best-value"
                    >
                      {{ scope.row.spatialComposition }}
                    </b>

                    <span v-else>
                      {{ scope.row.spatialComposition }}
                    </span>

                  </template>

                </el-table-column>


                <el-table-column
                  prop="objectCompleteness"
                  label="Object Completeness ↑"
                  min-width="150"
                  align="center"
                >

                  <template #default="scope">

                    <b
                      v-if="
                        isBest(
                          scope.row,
                          'objectCompleteness'
                        )
                      "
                      class="best-value"
                    >
                      {{ scope.row.objectCompleteness }}
                    </b>

                    <span v-else>
                      {{ scope.row.objectCompleteness }}
                    </span>

                  </template>

                </el-table-column>


                <el-table-column
                  prop="visualAesthetics"
                  label="Visual Aesthetics ↑"
                  min-width="135"
                  align="center"
                >

                  <template #default="scope">

                    <b
                      v-if="
                        isBest(
                          scope.row,
                          'visualAesthetics'
                        )
                      "
                      class="best-value"
                    >
                      {{ scope.row.visualAesthetics }}
                    </b>

                    <span v-else>
                      {{ scope.row.visualAesthetics }}
                    </span>

                  </template>

                </el-table-column>


                <el-table-column
                  prop="sizeConsistency"
                  label="Size Consistency ↑"
                  min-width="130"
                  align="center"
                >

                  <template #default="scope">

                    <b
                      v-if="
                        isBest(
                          scope.row,
                          'sizeConsistency'
                        )
                      "
                      class="best-value"
                    >
                      {{ scope.row.sizeConsistency }}
                    </b>

                    <span v-else>
                      {{ scope.row.sizeConsistency }}
                    </span>

                  </template>

                </el-table-column>

              </el-table>

            </div>

          </div>

        </section>
        <!-- ================================================== -->
        <!-- Qualitative comparison -->
        <!-- ================================================== -->
        <section class="comparison-panel qualitative-panel">

          <div class="comparison-section-heading">

            <h2 class="comparison-section-heading-label">
              Qualitative Comparison
            </h2>

            <span class="comparison-section-heading-line" />

          </div>


          <p class="comparison-helper">

            Visual comparison with existing methods across
            representative multi-concept scene descriptions.

          </p>


          <div class="qualitative-card">

            <img
              :src="`./baseline_compare.jpg`"
              alt="Qualitative comparison between SketchClaw and baseline methods"
            />

          </div>

        </section>
        <!-- ================================================== -->
        <!-- User study -->
        <!-- ================================================== -->
        <section class="comparison-panel userstudy-panel">

          <div class="comparison-section-heading">

            <h2 class="comparison-section-heading-label">
              User Study
            </h2>

            <span class="comparison-section-heading-line" />

          </div>


          <p class="comparison-helper">
            68 participants · 5,100 responses per baseline comparison and criterion ·
            3 evaluation criteria
          </p>



          <div class="userstudy-image-card">

            <img
              :src="`./user_study.jpg`"
              alt="User study results"
            />

          </div>
          <p class="userstudy-desc">

              We conduct a user study to evaluate SketchClaw against existing
              baseline methods. To ensure fair comparisons, we consider two
              evaluation settings based on the characteristics of different
              baselines: SketchClaw with structural refinement (Ours (refine))
              is compared with optimization-based methods, while the original
              SketchClaw without refinement is compared with LLM-based methods.
          </p>

        </section>

      </el-col>

    </el-row>

  </div>

</template>


<style scoped>

/* ============================================================\**
*\*   Section\**
*\*   ============================================================ */

.comparison-section {
  width: 100%;
}


.comparison-card-title {
  position: relative;
  z-index: 1;
  margin:
    0
    0
    10px;
  color: #222;
  font-size: 32px;
  font-weight: 750;
  line-height: 1.3;
  text-align: left;
}


/* ============================================================\**
*\*   Introduction card\**
*\*   ============================================================ */

.comparison-intro-card {
  position: relative;
  width: 100%;
  margin:
    0
    0
    36px;
  padding:
    25px
    28px
    23px;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      rgba(255, 250, 242, 0.96),
      rgba(249, 252, 247, 0.96) 48%,
      rgba(250, 248, 255, 0.96)
    );
  border: 1px solid #e5e2dd;
  border-radius: 14px;
  box-shadow:
    0
    6px
    18px
    rgba(35, 35, 35, 0.045);
  box-sizing: border-box;
}


.comparison-intro-card::after {
  position: absolute;
  right: -85px;
  bottom: -115px;
  width: 245px;
  height: 245px;
  background:
    radial-gradient(
      circle,
      rgba(165, 138, 208, 0.11),
      rgba(165, 138, 208, 0)
    );
  border-radius: 50%;
  pointer-events: none;
  content: '';
}


.comparison-kicker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
}


.comparison-kicker-bar {
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


.comparison-scope-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 17px;
}


.comparison-scope-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 27px;
  padding:
    5px
    10px;
  color: #4b4b47;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.2;
  border: 1px solid transparent;
  border-radius: 999px;
  box-sizing: border-box;
  white-space: nowrap;
}


.scope-quantitative {
  background: #fff0e5;
  border-color: #f3b17f;
}


.scope-qualitative {
  background: #eaf7ed;
  border-color: #9dccaa;
}


.scope-human {
  background: #f1ecfb;
  border-color: #b7a2df;
}


.comparison-desc {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0;
  color: #333;
  font-size: 17px;
  font-weight: 450;
  line-height: 1.72;
  text-align: justify;
}


/* ============================================================\**
*\*   Section headings\**
*\*   ============================================================ */

.comparison-panel {
  width: 100%;
  margin-bottom: 44px;
}


.comparison-section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin-bottom: 16px;
}


.comparison-section-heading-label {
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
  white-space: nowrap;
}


.comparison-section-heading-line {
  width: 100%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      #d9d9d9,
      rgba(217, 217, 217, 0)
    );
}


.comparison-helper {
  margin:
    0
    0
    16px;
  color: #555;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.6;
  text-align: left;
}


/* ============================================================\**
*\*   Quantitative card\**
*\*   ============================================================ */

.comparison-card {
  width: 100%;
  padding:
    18px
    18px
    16px;
  background:
    rgba(
      255,
      255,
      255,
      0.9
    );
  border: 1px solid #e0e1e4;
  border-radius: 12px;
  box-shadow:
    0
    5px
    16px
    rgba(
      0,
      0,
      0,
      0.045
    );
  box-sizing: border-box;
}


.evaluator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}


.evaluator-label {
  color: #555;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}


/* ============================================================\**
*\*   Tabs\**
*\*   ============================================================ */

.comparison-tabs {
  width: 100%;
  margin-bottom: 14px;
}


.comparison-tabs :deep(.el-tabs__header) {
  margin: 0;
}


.comparison-tabs :deep(.el-tabs__nav-wrap) {
  width: 100%;
}


.comparison-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}


.comparison-tabs :deep(.el-tabs__nav-scroll) {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 2px;
}


.comparison-tabs :deep(.el-tabs__nav) {
  display: flex;
  gap: 8px;
  padding: 3px;
  white-space: nowrap;
  background: #f5f5f3;
  border: 1px solid #e5e5e2;
  border-radius: 10px;
}


.comparison-tabs :deep(.el-tabs__item) {
  height: 34px;
  padding:
    0
    13px;
  color: #666;
  font-size: 13px;
  font-weight: 550;
  line-height: 34px;
  border-radius: 7px;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}


.comparison-tabs :deep(.el-tabs__item:hover) {
  color: #5f4a20;
}


.comparison-tabs :deep(.el-tabs__item.is-active) {
  color: #5f4a20;
  font-weight: 700;
  background: #fff8e8;
  box-shadow:
    inset
    0
    0
    0
    1px
    rgba(
      224,
      181,
      88,
      0.42
    );
}


.comparison-tabs :deep(.el-tabs__active-bar) {
  display: none;
}


/* ============================================================\**
*\*   Table\**
*\*   ============================================================ */

.table-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border:
    1px
    solid
    #e4e5e7;
  border-radius: 9px;
  scrollbar-color:
    #c4c4c4
    transparent;
  scrollbar-width: thin;
}


.table-scroll::-webkit-scrollbar {
  height: 6px;
}


.table-scroll::-webkit-scrollbar-track {
  background: transparent;
}


.table-scroll::-webkit-scrollbar-thumb {
  background: #c4c4c4;
  border-radius: 999px;
}


.comparison-table {
  width: 100%;
  min-width: 860px;
  color: #262626;
  font-size: 13px;
  border: none;
}


.comparison-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}


.comparison-table :deep(th.el-table__cell) {
  padding:
    11px
    0;
  background: #f7f7f5;
  border-bottom:
    1px
    solid
    #ddddda;
}


.comparison-table :deep(td.el-table__cell) {
  padding:
    11px
    0;
  border-bottom:
    1px
    solid
    #eeeeeb;
  background: #fff;
}


.comparison-table :deep(th.el-table__cell .cell) {
  color: #333;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
  white-space: normal;
}


.comparison-table :deep(td.el-table__cell .cell) {
  color: #333;
  font-variant-numeric: tabular-nums;
}


.comparison-table :deep(td.el-table__cell:first-child .cell),
.comparison-table :deep(th.el-table__cell:first-child .cell) {
  padding-left: 14px;
  text-align: left;
}


/* Highlight SketchClaw rows */

.comparison-table :deep(.sketchclaw-row td.el-table__cell) {
  background:
    rgba(
      238,
      248,
      235,
      0.78
    );
}


.comparison-table :deep(.sketchclaw-refine-row td.el-table__cell) {
  background:
    rgba(
      255,
      247,
      226,
      0.82
    );
}


.comparison-table :deep(.sketchclaw-row td.el-table__cell:first-child),
.comparison-table :deep(.sketchclaw-refine-row td.el-table__cell:first-child) {
  font-weight: 700;
}


.comparison-table :deep(.sketchclaw-row:hover td.el-table__cell),
.comparison-table :deep(.sketchclaw-refine-row:hover td.el-table__cell) {
  background:
    rgba(
      255,
      244,
      215,
      0.92
    );
}


.best-value {
  color: #6f5210;
  font-weight: 800;
}


/* ============================================================\**
*\*   Qualitative comparison\**
*\*   ============================================================ */

.qualitative-panel {
  margin-bottom: 48px;
}


.qualitative-card {
  width: 100%;
  padding: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e0e1e4;
  border-radius: 12px;
  box-shadow:
    0
    5px
    16px
    rgba(
      0,
      0,
      0,
      0.045
    );
  box-sizing: border-box;
}


.qualitative-card img {
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
  object-fit: contain;
  border-radius: 8px;
}


/* ============================================================\**
*\*   User study\**
*\*   ============================================================ */

.userstudy-panel {
  margin-bottom: 48px;
}


.userstudy-card {
  width: 100%;
  margin-bottom: 16px;
  padding:
    22px
    24px
    21px;
  background:
    linear-gradient(
      135deg,
      rgba(255, 250, 242, 0.93),
      rgba(250, 252, 248, 0.93) 52%,
      rgba(250, 248, 255, 0.93)
    );
  border: 1px solid #e4e1dc;
  border-radius: 12px;
  box-sizing: border-box;
}










.userstudy-meta {
  margin:
    0
    0
    12px;
  color: #7a6336;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.55;
  text-align: left;
}


.userstudy-desc {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.72;
  text-align: justify;
}


.userstudy-image-card {
  width: 100%;
  padding: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e0e1e4;
  border-radius: 12px;
  box-shadow:
    0
    5px
    16px
    rgba(
      0,
      0,
      0,
      0.045
    );
  box-sizing: border-box;
}


.userstudy-image-card img {
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
  object-fit: contain;
  border-radius: 8px;
}


/* ============================================================\**
*\*   Responsive\**
*\*   ============================================================ */

@media (max-width: 767px) {

  .comparison-scope-tags {
    justify-content: flex-start;
    margin-top: 14px;
  }


  .userstudy-meta {
    font-size: 13px;
  }


  .userstudy-card {
    padding:
      18px
      16px
      17px;
  }


  .userstudy-desc {
    font-size: 15px;
    text-align: left;
  }


  .userstudy-image-card {
    padding: 5px;
    border-radius: 9px;
  }


  .userstudy-image-card img {
    border-radius: 6px;
  }
  .comparison-card-title {
    font-size: 27px;
  }



  .comparison-intro-card {
    padding:
      22px
      18px
      20px;
    margin-bottom: 30px;
  }


  .comparison-desc {
    font-size: 16px;
    text-align: left;
  }
  .comparison-section-heading {
    gap: 10px;
    margin-bottom: 14px;
  }


  .comparison-section-heading-label {
    padding:
      5px
      11px;
    font-size: 21px;
  }



  .comparison-helper {
    font-size: 14px;
  }


  .comparison-card {
    padding:
      14px
      12px
      12px;
  }


  .comparison-tabs :deep(.el-tabs__item) {
    padding:
      0
      11px;
    font-size: 12px;
  }


  .comparison-table {
    min-width: 820px;
  }


  .qualitative-card {
    padding: 5px;
    border-radius: 9px;
  }


  .qualitative-card img {
    border-radius: 6px;
  }

}

</style>
