<script setup>
import abstract from '../mds/abstract.mdx';
</script>

<template>
  <div>
    <el-divider />

    <el-row justify="center">
      <el-col 
        :xs="24" 
        :sm="20" 
        :md="16" 
        :lg="12" 
        :xl="12"
      >
        <div class="abstract-text">
          <abstract />
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<style scoped>

.abstract-text {
  font-size: 20px;
  line-height: 1.8;
}

.abstract-text :deep(p) {
  font-size: inherit;
  line-height: inherit;
  text-align: justify;
}

</style>