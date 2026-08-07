<script>
import { Swiper, SwiperSlide} from 'swiper/vue';
import { Navigation, Pagination, Autoplay} from 'swiper/modules';
import 'swiper/css/bundle';

export default {
  components: {
      Swiper,
      SwiperSlide,
      Navigation,
      Pagination,
      Autoplay,
    },
  data() {
    return {
      modules: [
        Navigation,
        Pagination,
        Autoplay,
      ],
      // 选择要轮播的照片
      carousel_items: [
        {
          image: "./carousel/motor.png",
          text: "A motorbike traveling along a mountain road."
        },
        {
          image: "./carousel/fisherman.png",
          text: "A fisherman sitting beside the river."
        },
        {
          image: "./carousel/farm_field.png",
          text: "A farmer working in a large field."
        },
        {
          image: "./carousel/ducks.png",
          text: "Several ducks swimming on the lake."
        },
        {
          image: "./carousel/chef.png",
          text: "A chef preparing food in the kitchen."
        },
        {
          image: "./carousel/city.png",
          text: "A city skyline with multiple buildings."
        },
      ],
    }
  }
}
</script>

<template>
  <el-row justify="center">
    <el-col :span="24">
      <!-- 设置轮播图：循环播放、首张图序号、响应式、导航和分页、自动播放 -->
      <swiper
        :loop="true"
        :slidesPerView="1"
        :breakpoints="{
          600: {
            slidesPerView: 2,
          },
          800: {
            slidesPerView: 3,
          },
        }"
        :modules="modules"
        :navigation="{ 
          hideOnClick:true,
        }"
        :pagination="{ 
          hideOnClick:true,
          clickable:true, 
          type:'bullets' 
        }"
        :autoplay="{ 
          delay:5000,
          disableOnInteraction:false,
          pauseOnMouseEnter:true,
        }"
        >
        <swiper-slide 
          v-for="(item,index) in carousel_items" 
          :key="index"
        >
          <div class="carousel-item">
            <el-image :src="item.image"/>
            <p class="carousel-caption">
              {{ item.text }}
            </p>
          </div>
        </swiper-slide>
      </swiper>
    </el-col>
  </el-row>
</template>
  
<style>
/* 设置Swiper风格 */
.swiper {
  --swiper-theme-color: white;
  width: 80%;
  height: 450px;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-item {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.carousel-item .el-image {
  width: 100%;
  height: 360px;
  object-fit: contain;
}

.carousel-caption {
  margin-top: 8px;
  font-size: 16px;
  color: #444;
  text-align: center;
  line-height: 1.4;
}
</style>
  