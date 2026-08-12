<script lang="ts" setup>

const baseUrl = import.meta.env.BASE_URL

const relationExamples = [
  {
    image: `${baseUrl}limitation/1.jpg`,
    prompt: 'A woman is watering the plants with a kettle in the garden.',
  },
  {
    image: `${baseUrl}limitation/2.jpg`,
    prompt: 'A castle on top of a hill.',
  },
]

const instanceExamples = [
  {
    image: `${baseUrl}limitation/3.jpg`,
    label: 'Before',
  },
  {
    image: `${baseUrl}limitation/4.jpg`,
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
        <!-- Compact heading -->
        <!-- ================================================== -->

        <div class="limitations-heading">

          <div
            class="limitations-kicker"
            aria-hidden="true"
          >
            <span class="kicker-bar kicker-orange" />
            <span class="kicker-bar kicker-yellow" />
            <span class="kicker-bar kicker-green" />
            <span class="kicker-bar kicker-purple" />
          </div>

          <h1>
            Limitations
          </h1>

          <p>
            SketchClaw still faces challenges in complex relations,
            instance consistency, and computational efficiency.
          </p>

        </div>


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

/* ============================================================
   Section
   ============================================================ */

.limitations-section {
  width: 100%;
}


/* ============================================================
   Compact heading
   ============================================================ */

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


/* ============================================================
   Three-column grid
   ============================================================ */

.limitations-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 14px;
  width: 100%;
  margin-bottom: 48px;
}


/* ============================================================
   Cards
   ============================================================ */

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


/* ============================================================
   Image pairs
   ============================================================ */

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


/* ============================================================
   Computational cost
   ============================================================ */

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


/* ============================================================
   Tooltip
   ============================================================ */

:global(.limitation-prompt-tooltip) {
  max-width: 360px;
  color: #333;
  font-size: 13px;
  font-style: italic;
  line-height: 1.55;
  white-space: normal;
}


/* ============================================================
   Responsive
   ============================================================ */

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

  .limitations-heading h1 {
    font-size: 27px;
  }

  .limitations-heading p {
    font-size: 15px;
  }

}

</style>
