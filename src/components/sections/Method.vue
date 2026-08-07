<script setup lang="ts">

import Page from '../mds/how_work.mdx'
import Reasoning from './Reasoning.vue'
import Concept from './Concept.vue'
import Refine from './Refine.vue'

</script>


<template>

  <div class="how-work-section">


    <el-divider />


    <!-- ====================================================== -->
    <!-- Main method highlight -->
    <!-- ====================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <section class="method-highlight">

          <div
            class="method-kicker"
            aria-hidden="true"
          >

            <span class="method-kicker-colors">

              <i class="method-kicker-color method-kicker-orange" />
              <i class="method-kicker-color method-kicker-yellow" />
              <i class="method-kicker-color method-kicker-green" />
              <i class="method-kicker-color method-kicker-purple" />

            </span>

          </div>


          <h1 class="method-main-title">
            How does SketchClaw work?
          </h1>


          <p class="method-main-description">
            SketchClaw follows a three-stage workflow that transforms
            a scene-level textual description into an editable and structurally
            coherent multi-concept scene sketch.
          </p>


          <div
            class="method-stage-chips"
            aria-label="SketchClaw workflow stages"
          >

            <span class="method-chip method-chip-orange">
              Concept Representation
            </span>

            <span class="method-chip method-chip-green">
              Agentic Reasoning
            </span>

            <span class="method-chip method-chip-purple">
              Structure-aware Refinement
            </span>

          </div>

        </section>

      </el-col>

    </el-row>


    <!-- ====================================================== -->
    <!-- Overview -->
    <!-- ====================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <section class="method-section overview-section">

          <div class="how-work-content">

            <Page />

          </div>

        </section>

      </el-col>

    </el-row>


    <!-- ====================================================== -->
    <!-- Concept Representation -->
    <!-- ====================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div class="section-heading">

          <h2 class="section-heading-label">
            Step 1: Concept Representation
          </h2>

          <span class="section-heading-line" />

        </div>

      </el-col>

    </el-row>


    <div class="stage-content">

      <Concept
        embedded
        :show-title="false"
      />

    </div>


    <!-- ====================================================== -->
    <!-- Agentic Reasoning -->
    <!-- ====================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div class="section-heading">

          <h2 class="section-heading-label">
            Step 2: Agentic Reasoning
          </h2>

          <span class="section-heading-line" />

        </div>

      </el-col>

    </el-row>


    <div class="stage-content">

      <Reasoning
        embedded
        :show-title="false"
      />

    </div>


    <!-- ====================================================== -->
    <!-- Structure-aware Refinement -->
    <!-- ====================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div class="section-heading">

          <h2 class="section-heading-label">
            Step 3: Structure-aware Refinement
          </h2>

          <span class="section-heading-line" />

        </div>

      </el-col>

    </el-row>


    <div class="stage-content">

      <Refine
        embedded
        :show-title="false"
      />

    </div>


  </div>

</template>


<style scoped>

/* ============================================================
   Section
   ============================================================ */

.how-work-section {
  width: 100%;
}


/* ============================================================
   Main highlight card
   ============================================================ */

.method-highlight {
  position: relative;
  width: 100%;
  margin:
    0
    0
    30px;
  padding:
    27px
    30px
    24px;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      rgba(255, 249, 238, 0.97),
      rgba(248, 252, 244, 0.97) 48%,
      rgba(249, 246, 255, 0.97)
    );
  border:
    1px
    solid
    #e3e0db;
  border-radius: 14px;
  box-shadow:
    0
    6px
    18px
    rgba(35, 35, 35, 0.055);
  box-sizing: border-box;
}

.method-highlight::after {
  position: absolute;
  right: -70px;
  bottom: -95px;
  width: 218px;
  height: 218px;
  background:
    radial-gradient(
      circle,
      rgba(165, 138, 208, 0.12),
      rgba(165, 138, 208, 0)
    );
  border-radius: 50%;
  pointer-events: none;
  content: '';
}

.method-kicker {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.method-kicker-colors {
  display: flex;
  align-items: center;
  gap: 7px;
}

.method-kicker-color {
  display: block;
  width: 29px;
  height: 5px;
  border-radius: 999px;
}

.method-kicker-orange {
  background: #f39a54;
}

.method-kicker-yellow {
  background: #e9c957;
}

.method-kicker-green {
  background: #85bd74;
}

.method-kicker-purple {
  background: #a58ad0;
}

.method-main-title {
  position: relative;
  z-index: 1;
  margin:
    0
    0
    8px;
  color: #222;
  font-size: 32px;
  font-weight: 750;
  line-height: 1.3;
  text-align: left;
}

.method-main-description {
  position: relative;
  z-index: 1;
  max-width: 818px;
  margin:
    0
    0
    18px;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.7;
  text-align: left;
}


/* Workflow chips */

.method-stage-chips {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}

.method-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 0px;
  padding:
    5px
    11px;
  color: #303030;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.2;
  border:
    1px
    solid
    transparent;
  border-radius: 999px;
  box-sizing: border-box;
  white-space: nowrap;
}

.method-chip-orange {
  background: #fff0e5;
  border-color: #f3b17f;
}

.method-chip-green {
  background: #eaf7ed;
  border-color: #9dccaa;
}

.method-chip-purple {
  background: #f1ecfb;
  border-color: #b7a2df;
}


/* ============================================================
   Unified subsection headings
   ============================================================ */

.method-section {
  width: 100%;
}

.overview-section {
  margin-bottom: 40px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin:
    42px
    0
    18px;
}

.overview-section .section-heading {
  margin-top: 0;
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
   Overview content
   ============================================================ */

.how-work-content {
  width: 100%;
}

.how-work-content :deep(p) {
  margin:
    0
    0
    16px;
  color: #000;
  font-size: 18px;
  line-height: 1.8;
  text-align: justify;
}

.how-work-content :deep(strong) {
  font-weight: 650;
}

.how-work-content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin:
    18px
    auto
    0;
}


/* ============================================================
   Embedded content
   ============================================================ */

.stage-content {
  width: 100%;
}


/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 767px) {

  .method-highlight {
    padding:
      23px
      18px
      21px;
  }

  .method-main-title {
    font-size: 27px;
  }

  .method-main-description {
    font-size: 17px;
    line-height: 1.65;
  }

  .method-stage-chips {
    justify-content: flex-start;
  }

  .overview-section {
    margin-bottom: 30px;
  }

  .section-heading {
    gap: 10px;
    margin:
      34px
      0
      15px;
  }

  .overview-section .section-heading {
    margin-top: 0;
  }

  .section-heading-label {
    padding:
      5px
      11px;
    font-size: 21px;
  }

  .how-work-content :deep(p) {
    font-size: 17px;
    text-align: left;
  }

}

.gallery-interaction-tip {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 16px;
  padding: 12px 16px;
  color: #7a4313;
  font-size: 18px;
  font-weight: 650;
  line-height: 1.5;
  text-align: left;
  background:
    linear-gradient(
      90deg,
      rgba(255, 237, 215, 0.96),
      rgba(255, 248, 218, 0.78)
    );
  border: 1px solid rgba(231, 157, 74, 0.38);
  border-left: 4px solid #e89545;
  border-radius: 9px;
  box-shadow: 0 3px 10px rgba(150, 92, 31, 0.06);
}


.gallery-interaction-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: #a95c17;
  font-size: 17px;
  line-height: 1;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(221, 137, 54, 0.34);
  border-radius: 50%;
}

</style>
