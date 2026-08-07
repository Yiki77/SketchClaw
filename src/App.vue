<script setup lang="ts">
import Header from './components/Header.vue'
import Main from './components/Main.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app-page">

    <el-container class="app-container">

      <!-- Main Content -->
      <el-main class="app-main">
        <Main />
      </el-main>


    </el-container>

    <!-- Back to top -->
    <el-backtop
      :right="40"
      :bottom="80"
      class="app-backtop"
    />

  </div>
</template>

<style>
/* ============================================================
   Global page background
   ============================================================ */

html,
body,
#app {
  width: 100%;
  min-height: 100%;
  margin: 0;

  background: #fdfcfb;
}


/* ============================================================
   Basic global reset
   ============================================================ */

html {
  scroll-behavior: smooth;
}

body {
  min-width: 320px;

  color: #222;

  background: #fdfcfb;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}


/* ============================================================
   Root page
   ============================================================ */

.app-page {
  position: relative;

  width: 100%;
  min-height: 100vh;

  overflow-x: hidden;

  background:
    linear-gradient(
      180deg,
      #fffefd 0%,
      #fdfcfb 42%,
      #fcfbfa 100%
    );
}


/* ============================================================
   Element Plus container
   ============================================================ */

.app-container {
  width: 100%;
  min-height: 100vh;

  background: transparent;
}


/* ============================================================
   Header
   ============================================================ */

.app-header {
  width: 100%;

  height: auto !important;

  padding: 0 !important;

  background: transparent;
}


/* ============================================================
   Main
   ============================================================ */

.app-main {
  width: 100%;

  padding:
    0
    0
    28px !important;

  overflow: visible !important;

  background: transparent;
}


/* ============================================================
   Footer
   ============================================================ */

.app-footer {
  width: 100%;

  height: auto !important;

  padding: 0 !important;

  background: transparent;
}


/* ============================================================
   Back-to-top button
   ============================================================ */

.app-backtop {
  width: 42px !important;
  height: 42px !important;

  color: #6e5525 !important;

  background:
    rgba(
      255,
      255,
      255,
      0.94
    ) !important;

  border:
    1px
    solid
    rgba(
      226,
      210,
      177,
      0.95
    );

  box-shadow:
    0
    4px
    14px
    rgba(
      0,
      0,
      0,
      0.08
    ) !important;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.app-backtop:hover {
  background: #fff5df !important;

  box-shadow:
    0
    6px
    18px
    rgba(
      0,
      0,
      0,
      0.12
    ) !important;

  transform: translateY(-2px);
}


/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 767px) {

  .app-main {
    padding-bottom: 20px !important;
  }

}
</style>
