<script>
import Title from './sections/Title.vue'
import Method from './sections/Method.vue'
import BibTeX from './sections/BibTeX.vue'
import Comparison from './sections/Comparison.vue'
import Layouts from './sections/Layouts.vue'
import Ablation from './sections/Ablation.vue'
import Limitations from './sections/Limitations.vue'
import Intro from './sections/Intro.vue'

export default {
  components: {
    Title,
    Intro,
    Method,
    BibTeX,
    Comparison,
    Layouts,
    Ablation,
    Limitations
  }
}
</script>

<template>
  <Title/>
  <Intro/>
  <Method/>
  <Comparison/>
  <Layouts/>
  <Ablation/>
  <Limitations/>
  <BibTeX/>
</template>`${import.meta.env.BASE_URL}