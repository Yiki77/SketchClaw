<script lang="ts" setup>
import {
  Document,
  Files,
} from '@element-plus/icons-vue'

// 项目名称
const projectName = 'SketchClaw'

// 论文标题
const title =
  'Automatic Multi-Concept Scene Sketching with Coding Agents'

// 标题颜色
const titleColor = '#3f3f3f'

// 按钮颜色
const buttonColor = '#444444'

// 作者清单
const authors = [
  {
    name: 'Authors anonymized',
    homepage: '',
    icon: '',
    addressFlag: '',
  },
]

// 地址清单
const addresses: Array<{
  name: string
  homepage?: string
  icon?: string
  addressFlag?: string
}> = []

// 共一和通讯作者提示
const correspondingAuthorText = ''

// 强调内容
const emphases: string[] = []

// 引导资料链接
const buttons = [
  {
    disabled: false,
    name: 'Paper',
    link: '/paper/_AAAI_27__SketchClaw.pdf',
    component: Document,
  },
  {
    disabled: true,
    name: 'Arxiv',
    link:
      'https://github.com/JunyaoHu/academic-project-page-template-vue',
    component: Document,
  },
  {
    disabled: true,
    name: 'Code',
    link: '',
    component: Files,
  },
]
</script>

<template>
  <section class="title-section">
    <div class="title-content">
      <!-- 主标题 -->
      <el-row justify="center">
        <el-col
          :xs="24"
          :sm="23"
          :md="22"
          :lg="22"
          :xl="21"
        >
          <h1
            class="paper-title"
            :style="{ color: titleColor }"
          >
            <span class="sketch-title">
              {{ projectName }}
            </span>

            <span class="title-colon">
              :
            </span>

            <span class="normal-title">
              {{ title }}
            </span>
          </h1>
        </el-col>
      </el-row>

      <!-- 作者名单 -->
      <div class="author-list">
        <a
          v-for="author in authors"
          :key="author.name"
          class="author-link"
          :class="{
            'author-link-disabled': !author.homepage,
          }"
          :href="author.homepage || undefined"
          :target="author.homepage ? '_blank' : undefined"
          :rel="
            author.homepage
              ? 'noopener noreferrer'
              : undefined
          "
        >
          <el-avatar
            v-if="author.icon"
            :size="34"
            :src="author.icon"
            class="author-avatar"
          />

          <span class="author-name">
            {{ author.name }}

            <sup
              v-if="author.addressFlag"
              class="name-sup"
            >
              {{ author.addressFlag }}
            </sup>
          </span>
        </a>
      </div>

      <!-- 地址名单 -->
      <div
        v-if="addresses.length"
        class="address-list"
      >
        <a
          v-for="address in addresses"
          :key="address.name"
          class="address-link"
          :href="address.homepage || undefined"
          :target="
            address.homepage
              ? '_blank'
              : undefined
          "
          :rel="
            address.homepage
              ? 'noopener noreferrer'
              : undefined
          "
        >
          <el-avatar
            v-if="address.icon"
            :size="30"
            :src="address.icon"
            class="address-avatar"
          />

          <span class="address-name">
            <sup
              v-if="address.addressFlag"
              class="address-sup"
            >
              {{ address.addressFlag }}
            </sup>

            {{ address.name }}
          </span>
        </a>
      </div>

      <!-- 共一和通讯作者提示 -->
      <div
        v-if="correspondingAuthorText"
        class="corresponding-author"
      >
        {{ correspondingAuthorText }}
      </div>

      <!-- 强调内容 -->
      <div
        v-for="emphasis in emphases"
        :key="emphasis"
        class="emphasis"
      >
        {{ emphasis }}
      </div>

      <!-- 引导按钮 -->
      <div class="guidance-row">
        <template
          v-for="button in buttons"
          :key="button.name"
        >
          <a
            v-if="!button.disabled"
            :href="button.link"
            target="_blank"
            rel="noopener noreferrer"
            class="guidance-link"
          >
            <el-button
              class="guidance-button"
              size="large"
              :color="buttonColor"
              round
            >
              <el-icon :size="18">
                <component :is="button.component" />
              </el-icon>

              <span class="button-text">
                {{ button.name }}
              </span>
            </el-button>
          </a>

          <span
            v-else
            class="guidance-link guidance-link-disabled"
          >
            <el-button
              class="guidance-button"
              size="large"
              :color="buttonColor"
              disabled
              round
            >
              <el-icon :size="18">
                <component :is="button.component" />
              </el-icon>

              <span class="button-text">
                {{ button.name }}
              </span>
            </el-button>
          </span>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ============================================================
   整体标题区域
   ============================================================ */

.title-section {
  position: relative;
  width: 100%;
  padding:
    46px
    0
    28px;
  overflow: hidden;
  background: #fff;
  box-sizing: border-box;
}

.title-content {
  position: relative;
  z-index: 1;
  width: 100%;
}

/* ============================================================
   主标题
   ============================================================ */

.paper-title {
  display: block;
  width: 100%;
  max-width: 1420px;
  margin:
    0
    auto;
  font-family:
    'MyFont',
    Verdana,
    Arial,
    sans-serif;
  font-size:
    clamp(
      31px,
      3.05vw,
      45px
    );
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.1px;
  line-height: 1.28;
  text-align: center;
  text-wrap: balance;
}

/*
  桌面端保持整句一行。
  只有屏幕宽度不足时才允许自然换行。
*/
@media (min-width: 1100px) {
  .paper-title {
    white-space: nowrap;
  }
}

/* SketchClaw 渐变草图字体 */
.sketch-title {
  display: inline;
  font-family:
    'Segoe Print',
    'Bradley Hand',
    'Comic Sans MS',
    cursive;
  font-size: 1.15em;
  font-style: normal;
  font-weight: 700;
  letter-spacing: -1.2px;
  background:
    linear-gradient(
      90deg,
      #f39a54 0%,
      #e9c957 34%,
      #85bd74 66%,
      #a58ad0 100%
    );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.title-colon {
  display: inline;
  margin-right: 5px;
  font-family:
    'MyFont',
    Verdana,
    Arial,
    sans-serif;
  font-size: 0.96em;
  font-weight: 700;
}

.normal-title {
  display: inline;
  font-family:
    'MyFont',
    Verdana,
    Arial,
    sans-serif;
  font-size: 1em;
  font-style: normal;
  font-weight: 700;
}

/* ============================================================
   作者和地址
   ============================================================ */

.author-list,
.address-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.author-list {
  gap: 10px;
  margin-bottom: 7px;
}

.address-list {
  gap:
    8px
    18px;
  margin-top: 2px;
}

.author-link,
.address-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3d3d3d;
  text-decoration: none;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.author-link:hover,
.address-link:hover {
  color: #111;
  transform: translateY(-1px);
}

.author-link-disabled {
  cursor: default;
}

.author-link-disabled:hover {
  color: #3d3d3d;
  transform: none;
}

.author-name {
  font-size: 19px;
  font-weight: 500;
  line-height: 1.5;
}

.address-name {
  color: #555;
  font-size: 17px;
  line-height: 1.5;
}

.name-sup,
.address-sup {
  margin-left: 2px;
  color: #777;
  font-size: 0.72em;
}

.author-avatar,
.address-avatar {
  margin-right: 7px;
}

/* ============================================================
   补充信息
   ============================================================ */

.corresponding-author {
  margin: 13px 0 0;
  color: #666;
  font-family:
    Arial,
    sans-serif;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
}

.emphasis {
  margin: 9px 0;
  color: #8a6215;
  font-size: 19px;
  font-weight: 700;
  text-align: center;
}

/* ============================================================
   引导按钮
   ============================================================ */

.guidance-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
}

.guidance-link {
  display: inline-flex;
  color: inherit;
  text-decoration: none;
}

.guidance-button {
  min-width: 112px;
  height: 42px;
  padding:
    0
    19px;
  border: 0;
  box-shadow:
    0
    4px
    12px
    rgba(35, 35, 35, 0.13);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.guidance-link:not(.guidance-link-disabled)
.guidance-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0
    7px
    16px
    rgba(35, 35, 35, 0.17);
}

.guidance-link-disabled {
  cursor: not-allowed;
}

.guidance-button:disabled {
  color: #8d8d8d;
  background: #e9e9e9 !important;
  box-shadow: none;
  opacity: 1;
}

.button-text {
  margin-left: 3px;
  color: inherit;
  font-size: 16px;
  font-weight: 600;
}

/* ============================================================
   链接重置
   ============================================================ */

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  color: inherit;
  border-bottom: none;
}

/* ============================================================
   平板端
   ============================================================ */

@media (max-width: 1099px) {
  .paper-title {
    max-width: 920px;
    padding:
      0
      18px;
    box-sizing: border-box;
  }
}

/* ============================================================
   手机端
   ============================================================ */

@media (max-width: 768px) {
  .title-section {
    padding:
      32px
      0
      20px;
  }

  .paper-title {
    padding:
      0
      14px;
    font-size: 30px;
    line-height: 1.36;
  }

  .sketch-title {
    font-size: 1.13em;
    letter-spacing: -0.8px;
  }

  .author-name {
    font-size: 18px;
  }

  .address-name {
    font-size: 16px;
  }

  .guidance-row {
    gap: 8px;
    margin-top: 18px;
  }

  .guidance-button {
    min-width: 104px;
    height: 40px;
    padding:
      0
      16px;
  }
}

/* ============================================================
   小屏手机
   ============================================================ */

@media (max-width: 480px) {
  .paper-title {
    font-size: 27px;
    line-height: 1.4;
  }

  .guidance-row {
    padding:
      0
      12px;
  }
}
</style>
