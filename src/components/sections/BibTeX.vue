<script lang="ts" setup>
import { ElMessage } from 'element-plus'


const bibtex = [
  '@article{xxx,',
  '  title={xxx},',
  '  author={xxx},',
  '  journal={xxx},',
  '  year={xxx}',
  '}',
]


const copyVal = async () => {
  const text = bibtex.join('\n')

  try {
    await navigator.clipboard.writeText(text)

    ElMessage({
      message: 'BibTeX copied!',
      type: 'success',
      duration: 1500,
    })
  } catch (error) {
    console.error('Failed to copy BibTeX:', error)
  }
}
</script>


<template>
  <div>

    <el-divider />

    <!-- Title -->
    <el-row justify="center">
      <h1 class="section-title">
        BibTeX
      </h1>
    </el-row>


    <!-- BibTeX Card -->
    <el-row justify="center">

      <el-col
        class="bibtex"
        :xs="22"
        :sm="20"
        :md="14"
        :lg="12"
        :xl="12"
        @click="copyVal"
      >

        <!-- Copy Tip -->
        <div class="copy-tip">
          🖱️ Click here to copy BibTeX.
        </div>


        <!-- BibTeX Content -->
        <el-scrollbar class="bibtex-scroll">

          <pre id="bibtex"><code
            v-for="(b, index) in bibtex"
            :key="index"
          >{{ b }}<br /></code></pre>

        </el-scrollbar>

      </el-col>

    </el-row>

  </div>
</template>


<style scoped>

/* =========================
   Section Title
========================= */

.section-title {
  text-align: center;
}


/* =========================
   BibTeX Card
========================= */

.bibtex {
  margin-top: 10px;
  margin-bottom: 20px;

  padding: 0 18px 12px 18px;

  /* 保留卡片效果 */
  background-color: #f7f7f7;

  border-radius: 14px;

  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.05);

  cursor: pointer;

  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}


/* 鼠标放上去有轻微反馈 */
.bibtex:hover {
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.08);

  transform: translateY(-1px);
}


/* =========================
   Copy Tip
========================= */

.copy-tip {
  text-align: center;

  color: var(--el-text-color-secondary);

  margin-top: 18px;
  margin-bottom: 8px;

  font-size: 14px;
  font-weight: 400;

  /* 不单独加背景 */
  background: transparent;
}


/* =========================
   Scroll Area
========================= */

.bibtex-scroll {
  width: 100%;
}


/* =========================
   BibTeX Text
========================= */

#bibtex {
  margin: 0;

  padding: 12px 4px 16px 4px;

  /* 关键：
     pre 自己不再出现额外背景 */
  background: transparent !important;
  background-color: transparent !important;

  border: none !important;
  box-shadow: none !important;

  font-size: 15px;
  font-weight: 400;
  line-height: 1.55;

  overflow: visible;

  white-space: pre;
}


/* 关键：
   去掉每一行 code 后面的灰色底 */
#bibtex code {
  padding: 0 !important;
  margin: 0 !important;

  background: transparent !important;
  background-color: transparent !important;

  border: none !important;
  border-radius: 0 !important;

  box-shadow: none !important;

  font-weight: 400 !important;

  color: inherit;
}


/* Element Plus scrollbar 内部保持透明，
   让它直接显示外层卡片背景 */
.bibtex :deep(.el-scrollbar__wrap) {
  background: transparent !important;
}

.bibtex :deep(.el-scrollbar__view) {
  background: transparent !important;
}

</style>