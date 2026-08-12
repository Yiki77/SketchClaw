<script lang="ts" setup>
const baseUrl = import.meta.env.BASE_URL

const vlmBackboneImage = `${baseUrl}abla_banchmark.jpg`
const reasoningAblationImage = `${baseUrl}abla_Reasoning.jpg`
const contourResamplingImage = `${baseUrl}abla_resampling.jpg`
const progressiveJointImage = `${baseUrl}abla_joint.jpg`

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
</script>

<template>
  <div class="ablation-section">
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
        <!-- Ablation overview -->
        <!-- ================================================== -->
        <section class="ablation-intro-card">
          <div
            class="ablation-kicker"
            aria-hidden="true"
          >
            <span class="ablation-kicker-bar kicker-orange" />
            <span class="ablation-kicker-bar kicker-yellow" />
            <span class="ablation-kicker-bar kicker-green" />
            <span class="ablation-kicker-bar kicker-purple" />
          </div>

          <h1 class="ablation-card-title">
            Ablation Study
          </h1>

          <p class="ablation-desc">
            We systematically analyze the contribution of key components in
            SketchClaw.
          </p>

          <div
            class="ablation-scope-tags"
            aria-label="Ablation categories"
          >
            <span class="ablation-scope-tag scope-backbone">
              VLM Backbones
            </span>
            <span class="ablation-scope-tag scope-reasoning">
              Agentic Reasoning
            </span>
            <span class="ablation-scope-tag scope-refinement">
              Structure-aware Refinement
            </span>
          </div>
        </section>

        <!-- ================================================== -->
        <!-- Impact of VLM Backbones -->
        <!-- ================================================== -->
        <section class="ablation-panel">
          <div class="ablation-section-heading">
            <h2 class="ablation-section-heading-label">
              Impact of VLM Backbones
            </h2>
            <span class="ablation-section-heading-line" />
          </div>

          <div class="result-block">
            <div class="result-block-title">
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
                    <td class="method-col">
                      {{ row.method }}
                    </td>
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

          <div class="visual-block">
            <div class="visual-block-title">
              VLM Backbone Visual Comparison
            </div>

            <div class="figure-card">
              <img
                :src="vlmBackboneImage"
                alt="Visual comparison of different VLM backbones"
                class="ablation-figure"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <!-- ================================================== -->
        <!-- Impact of Agentic Reasoning -->
        <!-- ================================================== -->
        <section class="ablation-panel">
          <div class="ablation-section-heading">
            <h2 class="ablation-section-heading-label">
              Impact of Agentic Reasoning
            </h2>
            <span class="ablation-section-heading-line" />
          </div>

          <div class="result-block">
            <div class="result-block-title">
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
                    <td class="method-col">
                      {{ row.method }}
                    </td>
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

          <div class="visual-block">
            <div class="visual-block-title">
              Agentic Reasoning Ablation Examples
            </div>

            <div class="figure-card">
              <img
                :src="reasoningAblationImage"
                alt="Agentic reasoning component ablation examples"
                class="ablation-figure"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <!-- ================================================== -->
        <!-- Impact of Structure-aware Refinement -->
        <!-- ================================================== -->
        <section class="ablation-panel">
          <div class="ablation-section-heading">
            <h2 class="ablation-section-heading-label">
              Impact of Structure-aware Refinement
            </h2>
            <span class="ablation-section-heading-line" />
          </div>

          <!-- A. Contour resampling -->
          <div class="refinement-block">
            <div class="refinement-block-header">
              <span class="refinement-index">A</span>
              <div>
                <h3>Effect of Contour Resampling</h3>
                <p>
                  Contour resampling provides a more uniform Bézier
                  representation for object boundaries, supporting stable
                  structure-aware refinement while preserving the original
                  geometric contour.
                </p>
              </div>
            </div>

            <div class="figure-card refinement-figure-card">
              <img
                :src="contourResamplingImage"
                alt="Contour resampling comparison"
                class="ablation-figure"
                loading="lazy"
              />
            </div>
          </div>

          <!-- B. Progressive joint optimization -->
          <div class="refinement-block">
            <div class="refinement-block-header">
              <span class="refinement-index">B</span>
              <div>
                <h3>Effect of Progressive Joint Optimization</h3>
                <p>
                  Progressive optimization first stabilizes object-level
                  refinement and then gradually improves global scene
                  integration, reducing conflicts between local fidelity and
                  scene-level consistency.
                </p>
              </div>
            </div>

            <div class="figure-card refinement-figure-card">
              <img
                :src="progressiveJointImage"
                alt="Progressive joint optimization comparison"
                class="ablation-figure"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
/* ============================================================
   Section
   ============================================================ */

.ablation-section {
  width: 100%;
}

.ablation-card-title {
  position: relative;
  z-index: 1;
  margin: 0 0 10px;
  color: #222;
  font-size: 32px;
  font-weight: 750;
  line-height: 1.3;
  text-align: left;
}

/* ============================================================
   Introduction card
   ============================================================ */

.ablation-intro-card {
  position: relative;
  width: 100%;
  margin: 0 0 36px;
  padding: 25px 28px 23px;
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
  box-shadow: 0 6px 18px rgba(35, 35, 35, 0.045);
  box-sizing: border-box;
}

.ablation-intro-card::after {
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

.ablation-kicker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
}

.ablation-kicker-bar {
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

.ablation-desc {
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

.ablation-scope-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 17px;
}

.ablation-scope-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 27px;
  padding: 5px 10px;
  color: #4b4b47;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.2;
  border: 1px solid transparent;
  border-radius: 999px;
  box-sizing: border-box;
  white-space: nowrap;
}

.scope-backbone {
  background: #fff0e5;
  border-color: #f3b17f;
}

.scope-reasoning {
  background: #fff8d8;
  border-color: #e5cf71;
}

.scope-refinement {
  background: #eaf7ed;
  border-color: #9dccaa;
}

/* ============================================================
   Shared section heading
   ============================================================ */

.ablation-panel {
  width: 100%;
  margin-bottom: 50px;
}

.ablation-section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin-bottom: 18px;
}

.ablation-section-heading-label {
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
  white-space: nowrap;
}

.ablation-section-heading-line {
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
   Results / tables
   ============================================================ */

.result-block,
.visual-block {
  width: 100%;
  margin-bottom: 22px;
}

.result-block-title,
.visual-block-title {
  margin: 0 0 10px 2px;
  color: #333;
  font-size: 15px;
  font-weight: 720;
  line-height: 1.4;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  background: #fff;
  border: 1px solid #dedfe2;
  border-radius: 12px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.04);
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
  background: rgba(234, 247, 237, 0.58);
}

.ablation-table .best-row td {
  border-top: 1px solid #d6ded4;
}

.result-caption {
  margin: 10px 4px 0;
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
   Figures
   ============================================================ */

.figure-card {
  width: 100%;
  padding: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e0e1e4;
  border-radius: 12px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.045);
  box-sizing: border-box;
}

.ablation-figure {
  display: block;
  width: 100%;
  height: auto;
  background: #fff;
  border-radius: 7px;
  object-fit: contain;
}

/* ============================================================
   Refinement
   ============================================================ */

.refinement-block {
  width: 100%;
  margin-bottom: 22px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e1e4;
  border-radius: 12px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.038);
  box-sizing: border-box;
}

.refinement-block-header {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  margin-bottom: 16px;
}

.refinement-index {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #675538;
  font-size: 12px;
  font-weight: 800;
  background:
    linear-gradient(
      135deg,
      #fff0e5,
      #fff8d8,
      #eaf7ed
    );
  border: 1px solid #ded8cb;
  border-radius: 8px;
}

.refinement-block-header h3 {
  margin: 1px 0 7px;
  color: #292929;
  font-size: 17px;
  font-weight: 750;
  line-height: 1.4;
}

.refinement-block-header p {
  margin: 0;
  color: #555;
  font-size: 13px;
  line-height: 1.68;
  text-align: justify;
}

.refinement-figure-card {
  box-shadow: none;
}

/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 767px) {
  .ablation-intro-card {
    margin-bottom: 30px;
    padding: 22px 18px 20px;
  }

  .ablation-card-title {
    font-size: 27px;
  }

  .ablation-desc {
    font-size: 16px;
    text-align: left;
  }

  .ablation-scope-tags {
    justify-content: flex-start;
    margin-top: 14px;
  }

  .ablation-section-heading {
    gap: 10px;
    margin-bottom: 14px;
  }

  .ablation-section-heading-label {
    padding: 5px 11px;
    font-size: 17px;
    white-space: normal;
  }

  .result-block-title,
  .visual-block-title {
    font-size: 14px;
  }

  .ablation-table {
    font-size: 12px;
  }

  .refinement-block {
    padding: 17px 14px;
  }

  .refinement-block-header p {
    text-align: left;
  }

  .figure-card {
    padding: 5px;
    border-radius: 9px;
  }
}
</style>
