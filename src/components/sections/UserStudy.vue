<script lang="ts" setup>

</script>


<template>

<div>


  <el-divider />


  <!-- Title -->
  <el-row justify="center">

    <h1 class="section-title">
      User Study
    </h1>

  </el-row>



  <!-- Introduction -->
  <el-row justify="center">


    <el-col
      :xs="24"
      :sm="20"
      :md="16"
      :lg="12"
      :xl="12"
    >


      <p class="userstudy-desc">

        We conduct a user study to evaluate SketchClaw against existing baseline methods. To ensure fair comparisons, we consider two evaluation settings based on the characteristics of different baselines: SketchClaw with structural refinement (Ours (refine)) is compared with optimization-based methods, while the original SketchClaw without refinement is compared with LLM-based methods. This design isolates the effectiveness of layout reasoning and sketch generation from additional refinement effects. Participants are presented with a textual description and two randomly shuffled sketches to mitigate positional bias. They are asked to compare the two results from three perspectives: Object Completeness, Layout Alignment, and Visual Aesthetics. A total of 68 participants participated in the evaluation, producing 5,100 responses for each baseline comparison under each criterion. The preference results are summarized below, where SketchClaw consistently receives higher preference across different evaluation settings and baseline methods.
        
      </p>


    </el-col>


  </el-row>





  <!-- Image -->
  <el-row justify="center">


    <el-col

      :xs="24"
      :sm="20"
      :md="18"
      :lg="14"
      :xl="14"

    >


      <div class="image-container">


        <img

          src="/user_study.jpg"

          alt="User study results"

        />


      </div>


    </el-col>


  </el-row>




</div>


</template>




<style scoped>


/* introduction text */

.userstudy-desc {

  font-size:16px;

  line-height:1.8;

  text-align:justify;

  color:#000;

  margin-bottom:20px;

}



/* image */

.image-container {

  margin-top:30px;

  text-align:center;

}



.image-container img {

  width:100%;

  max-width:750px;

  height:auto;

}



</style>