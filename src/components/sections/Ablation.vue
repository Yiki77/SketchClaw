<script lang="ts" setup>

const reasoningAblations = [
  {
    key: 'plan',
    title: 'w/o Plan',
    subtitle: 'Code-driven Planning',
    effect:
      'Without executable scene programs, object attributes become harder to coordinate, leading to overlaps, unreasonable spatial arrangements, unrealistic scaling, and boundary violations.',
    tone: 'orange',
  },
  {
    key: 'geo',
    title: 'w/o Geo. Ver.',
    subtitle: 'Geometric Verification',
    effect:
      'Removing geometric constraints mainly affects physical plausibility, introducing out-of-bound strokes, invalid positions, and inconsistent relative scales.',
    tone: 'yellow',
  },
  {
    key: 'sem',
    title: 'w/o Sem. Ver.',
    subtitle: 'Visual-Semantic Verification',
    effect:
      'Without multimodal visual feedback, the agent may produce incorrect object relationships, missing semantic interactions, and unnatural occlusion orders.',
    tone: 'green',
  },
  {
    key: 'short',
    title: 'w/o Short Mem.',
    subtitle: 'Short-term Memory',
    effect:
      'Visual degradation can be limited, but the agent repeatedly explores similar unsuccessful layouts, increasing reflection steps from 1.375 to 2.875.',
    tone: 'purple',
  },
  {
    key: 'long',
    title: 'w/o Long Mem.',
    subtitle: 'Long-term Memory',
    effect:
      'The agent can still produce reasonable structures, but cannot retrieve reusable cross-concept layout experience, resulting in less effective scene composition.',
    tone: 'orange',
  },
]

const limitations = [
  {
    index: '01',
    title: 'Complex Relations',
    text:
      'SketchClaw may struggle with complex physical and semantic interactions, such as a woman interacting with a kettle or a castle located on a hill. Stronger relational and interaction modeling may improve scene understanding.',
  },
  {
    index: '02',
    title: 'Instance Consistency',
    text:
      'Structure-aware refinement may hallucinate redundant instances, such as duplicating a sheep. Instance-aware constraints could better preserve object identity and count.',
  },
  {
    index: '03',
    title: 'Computational Cost',
    text:
      'Multimodal verification and iterative optimization introduce additional computational cost, especially when multiple refinement rounds are required. More efficient verification and optimization remain future directions.',
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
            <span class="ablation-scope-tag scope-limitations">
              Limitations
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

          <div class="table-placeholder-card">
            <div class="placeholder-badge">TABLE</div>
            <div class="placeholder-title">
              VLM Backbone Ablation Table
            </div>
            <div class="placeholder-subtitle">
              Replace this block with the quantitative table from
              <code>Tables/abla_backbone</code>.
            </div>
          </div>

          <div class="figure-placeholder-card">
            <div class="figure-placeholder-canvas">
              <div class="placeholder-grid-lines" />
              <div class="figure-placeholder-content">
                <span class="figure-placeholder-index">FIG.</span>
                <strong>VLM Backbone Visual Comparison</strong>
                <small>
                  Placeholder for <code>Figures/abla_backbone</code>
                </small>
              </div>
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

          <div class="table-placeholder-card compact-placeholder">
            <div class="placeholder-badge">TABLE</div>
            <div class="placeholder-title">
              Agentic Reasoning Component Ablation
            </div>
            <div class="placeholder-subtitle">
              Place the quantitative component-ablation results here.
            </div>
          </div>

          <div class="figure-placeholder-card">
            <div class="figure-placeholder-canvas large-placeholder">
              <div class="placeholder-grid-lines" />
              <div class="figure-placeholder-content">
                <span class="figure-placeholder-index">FIG.</span>
                <strong>Agentic Reasoning Ablation Examples</strong>
                <small>
                  Placeholder for <code>Figures/supp_reasoning</code>
                </small>
              </div>
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

          <!-- Curve contour resampling -->
          <div class="figure-placeholder-card inner-figure-card">
            <div class="refinement-block-header">
              <span class="refinement-index">A</span>
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
            
            <div class="figure-placeholder-canvas">
            <div class="placeholder-grid-lines" />
            <div class="figure-placeholder-content">
                <span class="figure-placeholder-index">FIG.</span>
                <strong>Contour Resampling Comparison</strong>
                <small>
                Placeholder for <code>Figures/supp_resampling</code>
                </small>
            </div>
            </div>
          </div>

          <!-- Progressive joint optimization -->
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

            

            <div class="figure-placeholder-card inner-figure-card">
              <div class="figure-placeholder-canvas large-placeholder">
                <div class="placeholder-grid-lines" />
                <div class="figure-placeholder-content">
                  <span class="figure-placeholder-index">FIG.</span>
                  <strong>Progressive Joint Optimization</strong>
                  <small>
                    Placeholder for <code>Figures/supp_progressive</code>
                  </small>
                </div>
              </div>
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

.scope-limitations {
  background: #f1ecfb;
  border-color: #b7a2df;
}

/* ============================================================
   Shared section heading
   ============================================================ */

.ablation-panel {
  width: 100%;
  margin-bottom: 48px;
}

.ablation-section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin-bottom: 16px;
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

.ablation-helper {
  margin: 0 0 18px;
  color: #555;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.65;
  text-align: justify;
}

/* ============================================================
   Backbone summary
   ============================================================ */

.backbone-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin-bottom: 16px;
}

.backbone-summary-card {
  position: relative;
  min-height: 168px;
  padding: 18px 17px 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e2df;
  border-radius: 12px;
  box-sizing: border-box;
}

.backbone-summary-card::after {
  position: absolute;
  right: -24px;
  bottom: -34px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.32;
  content: '';
}

.card-orange::after {
  background: #f9d7bd;
}

.card-green::after {
  background: #d7ead4;
}

.card-purple::after {
  background: #dfd5f0;
}

.backbone-rank {
  margin-bottom: 10px;
  color: #9a917f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.backbone-summary-card h3 {
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  color: #292929;
  font-size: 15px;
  font-weight: 750;
  line-height: 1.4;
}

.backbone-summary-card p {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #555;
  font-size: 13px;
  line-height: 1.62;
}

/* ============================================================
   Table placeholders
   ============================================================ */

.table-placeholder-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  margin-bottom: 16px;
  padding: 20px;
  background:
    repeating-linear-gradient(
      -45deg,
      #fcfcfb,
      #fcfcfb 12px,
      #fafaf8 12px,
      #fafaf8 24px
    );
  border: 1px dashed #cfcfc9;
  border-radius: 11px;
  box-sizing: border-box;
  text-align: center;
}

.compact-placeholder {
  min-height: 108px;
}

.placeholder-badge {
  margin-bottom: 7px;
  padding: 3px 8px;
  color: #796841;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.09em;
  background: #fff7df;
  border: 1px solid #ead89c;
  border-radius: 999px;
}

.placeholder-title {
  margin-bottom: 5px;
  color: #3b3b38;
  font-size: 15px;
  font-weight: 700;
}

.placeholder-subtitle {
  color: #777;
  font-size: 12px;
  line-height: 1.55;
}

.placeholder-subtitle code,
.figure-placeholder-content code {
  color: #665d4c;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.95em;
}

/* ============================================================
   Figure placeholders
   ============================================================ */

.figure-placeholder-card {
  width: 100%;
  padding: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e0e1e4;
  border-radius: 12px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.045);
  box-sizing: border-box;
}

.inner-figure-card {
  margin-top: 16px;
  box-shadow: none;
}

.figure-placeholder-canvas {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      rgba(255, 248, 237, 0.72),
      rgba(248, 252, 247, 0.72) 50%,
      rgba(249, 247, 253, 0.72)
    );
  border: 1px dashed #d5d3cf;
  border-radius: 8px;
}

.large-placeholder {
  min-height: 290px;
}

.placeholder-grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(65, 65, 65, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(65, 65, 65, 0.04) 1px, transparent 1px);
  background-size: 22px 22px;
  pointer-events: none;
}

.figure-placeholder-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 26px;
  color: #565656;
  text-align: center;
}

.figure-placeholder-index {
  margin-bottom: 8px;
  color: #9b8c6a;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.figure-placeholder-content strong {
  margin-bottom: 6px;
  color: #363636;
  font-size: 16px;
  font-weight: 750;
}

.figure-placeholder-content small {
  color: #858585;
  font-size: 12px;
  line-height: 1.5;
}

.figure-caption {
  margin: 10px 6px 2px;
  color: #666;
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
}

/* ============================================================
   Agentic reasoning ablations
   ============================================================ */

.reasoning-ablation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.reasoning-ablation-card {
  position: relative;
  min-height: 148px;
  padding: 17px 18px 16px;
  background: #fff;
  border: 1px solid #e2e2df;
  border-radius: 12px;
  box-sizing: border-box;
}

.reasoning-ablation-card:last-child {
  grid-column: 1 / -1;
}

.reasoning-ablation-card::before {
  position: absolute;
  top: 0;
  left: 18px;
  width: 52px;
  height: 4px;
  border-radius: 0 0 999px 999px;
  content: '';
}

.reasoning-orange::before {
  background: #f39a54;
}

.reasoning-yellow::before {
  background: #e9c957;
}

.reasoning-green::before {
  background: #85bd74;
}

.reasoning-purple::before {
  background: #a58ad0;
}

.reasoning-card-topline {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.reasoning-ablation-name {
  color: #282828;
  font-size: 15px;
  font-weight: 780;
}

.reasoning-module-name {
  color: #8a8a84;
  font-size: 11px;
  font-weight: 650;
}

.reasoning-ablation-card p {
  margin: 0;
  color: #555;
  font-size: 13px;
  line-height: 1.68;
  text-align: justify;
}

/* ============================================================
   Refinement
   ============================================================ */

.refinement-block {
  width: 100%;
  margin-bottom: 20px;
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

.comparison-note-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.comparison-note {
  padding: 14px 15px;
  border: 1px solid #e4e3df;
  border-radius: 10px;
}

.note-negative {
  background: #fff8f2;
}

.note-positive {
  background: #f4faf3;
}

.comparison-note-label {
  display: inline-block;
  margin-bottom: 7px;
  color: #4a4945;
  font-size: 12px;
  font-weight: 750;
}

.comparison-note p {
  margin: 0;
  color: #5c5c58;
  font-size: 12px;
  line-height: 1.62;
}

.optimization-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.optimization-card {
  position: relative;
  min-height: 126px;
  padding: 15px 16px 14px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e3e2de;
  border-radius: 10px;
}

.optimization-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  content: '';
}

.opt-orange::before {
  background: #f39a54;
}

.opt-yellow::before {
  background: #e9c957;
}

.opt-purple::before {
  background: #a58ad0;
}

.opt-green::before {
  background: #85bd74;
}

.ours-card {
  background: #f7fbf5;
}

.optimization-card h4 {
  margin: 0 0 7px;
  color: #333;
  font-size: 13px;
  font-weight: 760;
}

.optimization-card p {
  margin: 0;
  color: #5b5b57;
  font-size: 12px;
  line-height: 1.62;
}

/* ============================================================
   Limitations
   ============================================================ */

.limitations-panel {
  margin-bottom: 52px;
}

.limitations-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.limitation-card {
  position: relative;
  min-height: 210px;
  padding: 18px 17px 16px;
  overflow: hidden;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.96),
      rgba(250, 249, 247, 0.96)
    );
  border: 1px solid #e3e1de;
  border-radius: 12px;
  box-sizing: border-box;
}

.limitation-index {
  display: inline-block;
  margin-bottom: 15px;
  color: #aa9a7b;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.1em;
}

.limitation-card h3 {
  margin: 0 0 9px;
  color: #2e2e2c;
  font-size: 15px;
  font-weight: 750;
}

.limitation-card p {
  margin: 0;
  color: #595955;
  font-size: 12.5px;
  line-height: 1.66;
  text-align: justify;
}

.limitation-figure-card {
  margin-top: 4px;
}

/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 900px) {
  .backbone-summary-grid,
  .limitations-grid {
    grid-template-columns: 1fr;
  }

  .backbone-summary-card,
  .limitation-card {
    min-height: auto;
  }
}

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

  .ablation-helper {
    font-size: 14px;
    text-align: left;
  }

  .reasoning-ablation-grid,
  .comparison-note-grid,
  .optimization-grid {
    grid-template-columns: 1fr;
  }

  .reasoning-ablation-card:last-child {
    grid-column: auto;
  }

  .reasoning-ablation-card p,
  .refinement-block-header p,
  .limitation-card p {
    text-align: left;
  }

  .refinement-block {
    padding: 17px 14px;
  }

  .figure-placeholder-card {
    padding: 5px;
    border-radius: 9px;
  }

  .figure-placeholder-canvas {
    min-height: 205px;
    border-radius: 6px;
  }

  .large-placeholder {
    min-height: 230px;
  }
}
</style>
