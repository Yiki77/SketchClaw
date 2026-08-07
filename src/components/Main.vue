<script>
import Title from './sections/Title.vue'
import Method from './sections/Method.vue'
import BibTeX from './sections/BibTeX.vue'
import Comparison from './sections/Comparison.vue'
import Layouts from './sections/Layouts.vue'
import Intro from './sections/Intro.vue'
import Gallery from './sections/Gallery.vue'

export default {
  components: {
    Title,
    Intro,
    Method,
    BibTeX,
    Comparison,
    Layouts,
    Gallery,
  }
}
</script>

<template>
  <Title/>
  <Intro/>
  <Method/>
  <Comparison/>
  <Layouts/>
  <Gallery/>
  <BibTeX/>
</template>`${import.meta.env.BASE_URL}