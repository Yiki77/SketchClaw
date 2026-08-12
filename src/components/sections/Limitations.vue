<script lang="ts" setup>

const limitations = [
  {
    index: '01',
    title: 'Complex Relations',
    text:
      'SketchClaw may struggle with complex physical and semantic interactions, such as a woman interacting with a kettle or a castle located on a hill. Stronger relational and interaction modeling may improve complex scene understanding.',
    tone: 'orange',
  },
  {
    index: '02',
    title: 'Instance Consistency',
    text:
      'Structure-aware refinement may hallucinate redundant instances, leading to object inconsistency, such as duplicating a sheep. Instance-aware constraints could better preserve object identity and count.',
    tone: 'green',
  },
  {
    index: '03',
    title: 'Computational Cost',
    text:
      'Multimodal verification and iterative optimization introduce additional computational costs, particularly when multiple refinement rounds are required. More efficient verification and optimization strategies remain an important future direction.',
    tone: 'purple',
  },
]

</script>

<template>
  <div class="limitations-section">
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
        <!-- Limitations overview -->
        <!-- ================================================== -->
        <section class="limitations-intro-card">
          <div
            class="limitations-kicker"
            aria-hidden="true"
          >
            <span class="limitations-kicker-bar kicker-orange" />
            <span class="limitations-kicker-bar kicker-yellow" />
            <span class="limitations-kicker-bar kicker-green" />
            <span class="limitations-kicker-bar kicker-purple" />
          </div>

          <h1 class="limitations-card-title">
            Limitations
          </h1>

          <p class="limitations-desc">
            Although SketchClaw effectively generates editable multi-concept
            scene sketches, several challenges remain in complex relational
            reasoning, instance consistency during refinement, and
            computational efficiency.
          </p>

          <div
            class="limitations-scope-tags"
            aria-label="Limitation categories"
          >
            <span class="limitations-scope-tag scope-relations">
              Complex Relations
            </span>
            <span class="limitations-scope-tag scope-instance">
              Instance Consistency
            </span>
            <span class="limitations-scope-tag scope-cost">
              Computational Cost
            </span>
          </div>
        </section>

        <!-- ================================================== -->
        <!-- Main limitations -->
        <!-- ================================================== -->
        <section class="limitations-panel">

          <!-- ================================================== -->
          <!-- Figure placeholder -->
          <!-- ================================================== -->
          <div class="figure-placeholder-card">
            <div class="figure-placeholder-canvas">
              <div class="placeholder-grid-lines" />

              <div class="figure-placeholder-content">
                <span class="figure-placeholder-index">FIG.</span>
                <strong>Limitation Examples</strong>
                <small>
                  Placeholder for <code>Figures/limitation</code>
                </small>
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

.limitations-section {
  width: 100%;
}

.limitations-card-title {
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

.limitations-intro-card {
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

.limitations-intro-card::after {
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

.limitations-kicker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
}

.limitations-kicker-bar {
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

.limitations-desc {
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

.limitations-scope-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 17px;
}

.limitations-scope-tag {
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

.scope-relations {
  background: #fff0e5;
  border-color: #f3b17f;
}

.scope-instance {
  background: #eaf7ed;
  border-color: #9dccaa;
}

.scope-cost {
  background: #f1ecfb;
  border-color: #b7a2df;
}

/* ============================================================
   Heading
   ============================================================ */

.limitations-panel {
  width: 100%;
  margin-bottom: 52px;
}

.limitations-section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin-bottom: 16px;
}

.limitations-section-heading-label {
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

.limitations-section-heading-line {
  width: 100%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      #d9d9d9,
      rgba(217, 217, 217, 0)
    );
}

.limitations-helper {
  margin: 0 0 18px;
  color: #555;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.65;
  text-align: justify;
}

/* ============================================================
   Limitation cards
   ============================================================ */

.limitations-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.limitation-card {
  position: relative;
  min-height: 220px;
  padding: 18px 17px 17px;
  overflow: hidden;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.97),
      rgba(250, 249, 247, 0.97)
    );
  border: 1px solid #e3e1de;
  border-radius: 12px;
  box-sizing: border-box;
}

.limitation-card::before {
  position: absolute;
  top: 0;
  left: 17px;
  width: 48px;
  height: 4px;
  border-radius: 0 0 999px 999px;
  content: '';
}

.limitation-orange::before {
  background: #f39a54;
}

.limitation-green::before {
  background: #85bd74;
}

.limitation-purple::before {
  background: #a58ad0;
}

.limitation-card-topline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.limitation-index {
  color: #aa9a7b;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.1em;
}

.limitation-dot {
  width: 4px;
  height: 4px;
  background: #c7c2b8;
  border-radius: 50%;
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
  line-height: 1.68;
  text-align: justify;
}

/* ============================================================
   Figure placeholder
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

.figure-placeholder-canvas {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
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

.figure-placeholder-content code {
  color: #665d4c;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.95em;
}

.figure-caption {
  margin: 10px 6px 2px;
  color: #666;
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
}

/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 900px) {
  .limitations-grid {
    grid-template-columns: 1fr;
  }

  .limitation-card {
    min-height: auto;
  }
}

@media (max-width: 767px) {
  .limitations-intro-card {
    margin-bottom: 30px;
    padding: 22px 18px 20px;
  }

  .limitations-card-title {
    font-size: 27px;
  }

  .limitations-desc {
    font-size: 16px;
    text-align: left;
  }

  .limitations-scope-tags {
    justify-content: flex-start;
    margin-top: 14px;
  }

  .limitations-section-heading {
    gap: 10px;
    margin-bottom: 14px;
  }

  .limitations-section-heading-label {
    padding: 5px 11px;
    font-size: 17px;
    white-space: normal;
  }

  .limitations-helper,
  .limitation-card p {
    text-align: left;
  }

  .limitations-helper {
    font-size: 14px;
  }

  .figure-placeholder-card {
    padding: 5px;
    border-radius: 9px;
  }

  .figure-placeholder-canvas {
    min-height: 215px;
    border-radius: 6px;
  }
}
</style>
