<script lang="ts" setup>

const relationExamples = [
  {
    image: `./limitation/1.jpg`,
    prompt: 'A woman is watering the plants with a kettle in the garden.',
  },
  {
    image: `./limitation/2.jpg`,
    prompt: 'A castle on top of a hill.',
  },
]

const instanceExamples = [
  {
    image: `./limitation/3.jpg`,
    label: 'Before',
  },
  {
    image: `./limitation/4.jpg`,
    label: 'After',
  },
]

const instancePrompt =
  'A sheep is eating grass in the mountains.'

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
        <!-- Main highlight -->
        <!-- ================================================== -->

        <section class="limitations-highlight">
          <div class="limitations-kicker" aria-hidden="true">
            <span class="limitations-kicker-colors">
              <i class="limitations-kicker-color kicker-orange" />
              <i class="limitations-kicker-color kicker-yellow" />
              <i class="limitations-kicker-color kicker-green" />
              <i class="limitations-kicker-color kicker-purple" />
            </span>
          </div>

          <h1 class="limitations-main-title">
            Limitations
          </h1>

          <p class="limitations-main-description">
            SketchClaw still faces challenges in complex relations,
            instance consistency, and computational efficiency.
          </p>

          <div
            class="limitations-feature-chips"
            aria-label="Limitation categories"
          >
            <span class="limitations-chip chip-orange">
              Complex Relations
            </span>

            <span class="limitations-chip chip-green">
              Instance Consistency
            </span>

            <span class="limitations-chip chip-purple">
              Computational Cost
            </span>
          </div>
        </section>

        <!-- ================================================== -->
        <!-- One-row limitations -->
        <!-- ================================================== -->

        <div class="limitations-grid">


          <!-- A. Complex Relations -->
          <article class="limitation-card card-orange">

            <div class="card-heading">

              <span class="card-index index-orange">
                A
              </span>

              <h2>
                Complex Relations
              </h2>

            </div>


            <div class="paired-images">

              <figure
                v-for="(example, index) in relationExamples"
                :key="example.image"
                class="mini-figure"
              >

                <el-tooltip
                  :content="example.prompt"
                  placement="top"
                  effect="light"
                  :show-after="200"
                  popper-class="limitation-prompt-tooltip"
                >

                  <div
                    class="mini-image-stage"
                    tabindex="0"
                  >

                    <img
                      :src="example.image"
                      :alt="example.prompt"
                      class="mini-image"
                      loading="lazy"
                    />

                    <span class="case-badge">
                      A{{ index + 1 }}
                    </span>

                  </div>

                </el-tooltip>

              </figure>

            </div>


            <p class="card-note">
              Difficult relational and interaction reasoning.
            </p>

          </article>


          <!-- B. Instance Consistency -->
          <article class="limitation-card card-green">

            <div class="card-heading">

              <span class="card-index index-green">
                B
              </span>

              <h2>
                Instance Consistency
              </h2>

            </div>


            <el-tooltip
              :content="instancePrompt"
              placement="top"
              effect="light"
              :show-after="200"
              popper-class="limitation-prompt-tooltip"
            >

              <div
                class="paired-images"
                tabindex="0"
              >

                <figure
                  v-for="example in instanceExamples"
                  :key="example.image"
                  class="mini-figure"
                >

                  <div class="mini-image-stage">

                    <img
                      :src="example.image"
                      :alt="`${example.label}: ${instancePrompt}`"
                      class="mini-image"
                      loading="lazy"
                    />

                    <span class="case-badge">
                      {{ example.label }}
                    </span>

                  </div>

                </figure>

              </div>

            </el-tooltip>


            <p class="card-note">
              Refinement may introduce redundant instances.
            </p>

          </article>


          <!-- C. Computational Cost -->
          <article class="limitation-card card-purple">

            <div class="card-heading">

              <span class="card-index index-purple">
                C
              </span>

              <h2>
                Computational Cost
              </h2>

            </div>

            <p class="card-note">
            Multimodal verification and iterative refinement introduce additional
            computational overhead, especially when multiple optimization rounds are required.
            </p>

          </article>


        </div>

      </el-col>

    </el-row>

  </div>
</template>


<style scoped>

/* ============================================================*
*   Section*
*   ============================================================ */

.limitations-section {
  width: 100%;
}


/* ============================================================*
*   Compact heading*
*   ============================================================ */

.limitations-heading {
  margin-bottom: 18px;
}

.limitations-kicker {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
}

.kicker-bar {
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

.limitations-heading h1 {
  margin: 0 0 7px;
  color: #222;
  font-size: 32px;
  font-weight: 750;
  line-height: 1.3;
}

.limitations-heading p {
  margin: 0;
  color: #555;
  font-size: 16px;
  line-height: 1.65;
}


/* ============================================================*
*   Three-column grid*
*   ============================================================ */


/* ============================================================
   Main highlight card
   ============================================================ */

.limitations-highlight {
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

.limitations-highlight::after {
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

.limitations-kicker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.limitations-kicker-colors {
  display: flex;
  align-items: center;
  gap: 7px;
}

.limitations-kicker-color {
  display: block;
  width: 29px;
  height: 5px;
  border-radius: 999px;
}

.limitations-main-title {
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  color: #222;
  font-size: 32px;
  font-weight: 750;
  line-height: 1.3;
  text-align: left;
}

.limitations-main-description {
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

.limitations-feature-chips {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}

.limitations-chip {
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

.chip-green {
  background: #eaf7ed;
  border-color: #9dccaa;
}

.chip-purple {
  background: #f1ecfb;
  border-color: #b7a2df;
}

.limitations-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 14px;
  width: 100%;
  margin-bottom: 48px;
}


/* ============================================================*
*   Cards*
*   ============================================================ */

.limitation-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 14px;
  background: #fff;
  border: 1px solid #e1e2e5;
  border-radius: 12px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.038);
  box-sizing: border-box;
}

.card-orange {
  border-top: 3px solid #f3b17f;
}

.card-green {
  border-top: 3px solid #9dccaa;
}

.card-purple {
  border-top: 3px solid #b7a2df;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  margin-bottom: 10px;
}

.card-index {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  font-size: 10px;
  font-weight: 850;
  border-radius: 7px;
  box-sizing: border-box;
}

.index-orange {
  color: #875127;
  background: #fff0e5;
  border: 1px solid #f3b17f;
}

.index-green {
  color: #496c4d;
  background: #eaf7ed;
  border: 1px solid #9dccaa;
}

.index-purple {
  color: #66518d;
  background: #f1ecfb;
  border: 1px solid #b7a2df;
}

.card-heading h2 {
  min-width: 0;
  margin: 0;
  color: #292929;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.35;
}


/* ============================================================*
*   Image pairs*
*   ============================================================ */

.paired-images {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  width: 100%;
}

.mini-figure {
  min-width: 0;
  margin: 0;
}

.mini-image-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 0.82;
  overflow: hidden;
  background: #fafafa;
  border: 1px solid #e2e2df;
  border-radius: 8px;
  box-sizing: border-box;
  cursor: default;
}

.mini-image-stage:focus-visible,
.paired-images:focus-visible {
  outline: 2px solid rgba(165, 138, 208, 0.42);
  outline-offset: 2px;
}

.mini-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.case-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 3px 6px;
  color: #555;
  font-size: 8px;
  font-weight: 750;
  line-height: 1.2;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(215, 215, 215, 0.92);
  border-radius: 999px;
  backdrop-filter: blur(3px);
}

.card-note {
  margin: 9px 1px 0;
  color: #666;
  font-size: 11.5px;
  line-height: 1.45;
}


/* ============================================================*
*   Computational cost*
*   ============================================================ */

.cost-visual {
  display: flex;
  flex: 1;
  min-height: 112px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px 7px;
  background:
    linear-gradient(
      145deg,
      #fcfbff,
      #f7f3fc
    );
  border: 1px solid #e3daef;
  border-radius: 8px;
  box-sizing: border-box;
}

.cost-step {
  display: flex;
  min-width: 48px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 9px 5px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #dfd6ec;
  border-radius: 8px;
  box-sizing: border-box;
}

.cost-step span {
  color: #9c8bb7;
  font-size: 8px;
  font-weight: 850;
}

.cost-step strong {
  color: #51475d;
  font-size: 10px;
  font-weight: 750;
}

.cost-arrow {
  color: #aa9bbb;
  font-size: 12px;
  font-weight: 700;
}


/* ============================================================*
*   Tooltip*
*   ============================================================ */

:global(.limitation-prompt-tooltip) {
  max-width: 360px;
  color: #333;
  font-size: 13px;
  font-style: italic;
  line-height: 1.55;
  white-space: normal;
}


/* ============================================================*
*   Responsive*
*   ============================================================ */

@media (max-width: 991px) {

  .limitations-grid {
    grid-template-columns: 1fr;
  }

  .limitation-card {
    max-width: 100%;
  }

  .mini-image-stage {
    aspect-ratio: 1.5 / 1;
  }

}

@media (max-width: 767px) {

  .limitations-highlight {
    padding: 23px 18px 21px;
  }

  .limitations-main-title {
    font-size: 27px;
  }

  .limitations-main-description {
    font-size: 17px;
    text-align: left;
  }

  .limitations-feature-chips {
    justify-content: flex-start;
  }

}

</style>