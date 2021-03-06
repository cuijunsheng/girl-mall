<template>
  <div id="home">
    <nav-bar class="home-nav">
      <div slot="center">购物街</div>
    </nav-bar>
    <tab-control :titles="['流行','新款','精选']" class="tab-control" ref="tabControl1"
                 @tabClick="tabClick"
                 :class="{'tab-control-fixed':isFixed}" v-show="isFixed"/>
    <scroll class="scroll-content" ref="scroll" :probe-type="3" @scroll="contentScroll" :pullUpLoad="true"
            @pullingUp="loadMore">
      <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"/>
      <home-recommend-views :recommends="recommends"/>
      <feature-view/>
      <tab-control :titles="['流行','新款','精选']" class="tab-control" ref="tabControl2"
                   @tabClick="tabClick"
                   :class="{'tab-control-fixed':isFixed}"/>
      <goods-list :goods="showGoods"/>
    </scroll>
    <!--监听组件根元素的原生事件，必须用事件修饰符.native-->
    <back-top @click.native="backTop" v-show="isShowBackTop"/>
  </div>
</template>

<script>
  import HomeSwiper from './components/HomeSwiper'
  import HomeRecommendViews from './components/RecommendView'
  import FeatureView from './components/FeatureView'

  import NavBar from 'components/common/navbar/NavBar'
  import TabControl from 'components/context/tabControl/TabControl'
  import GoodsList from 'components/context/goodsList/GoodsList'
  import Scroll from "components/common/scroll/Scroll";
  import BackTop from "components/context/backTop/BackTop";

  import {getHomeMultiData, getHomeGoods} from "network/home";
  import {imgLoadListenerMixin} from "common/mixins";

  export default {
    name: "Home",
    data() {
      return {
        banners: [],
        recommends: [],
        goods: {
          pop: {page: 0, list: []},
          new: {page: 0, list: []},
          sell: {page: 0, list: []}
        },
        currentType: 'pop',
        isShowBackTop: false,
        tabOffsetTop: 0,
        isFixed: false,
        saveScrollY: 0
      }
    },
    components: {
      NavBar,
      TabControl,
      HomeSwiper,
      HomeRecommendViews,
      FeatureView,
      GoodsList,
      Scroll,
      BackTop
    },
    mixins:[imgLoadListenerMixin],
    created() {
      //1.请求首页基本数据
      this.getHomeMultiData();

      //2.请求首页商品数据
      this.getHomeGoods('pop')
      this.getHomeGoods('new')
      this.getHomeGoods('sell')

    },
    mounted() {
      //此处全局监听事件，监听图片加载内容抽到了混入对象中
    },
    activated() {
      this.$refs.scroll.refresh();
      this.$refs.scroll.scrollTo(0, this.saveScrollY, 0)
    },
    deactivated() {
      this.saveScrollY = this.$refs.scroll.getScrollY();
      this.$bus.$off('imageLoad',this.imgLoadListener);
    },
    computed: {
      showGoods() {
        return this.goods[this.currentType].list
      }
    },
    methods: {
      /**
       * 事件监听相关的方法
       */
      tabClick(index) {
        switch (index) {
          case(0):
            this.currentType = 'pop'
            break
          case(1):
            this.currentType = 'new'
            break
          case(2):
            this.currentType = 'sell'
            break
        }
        this.$refs.tabControl1.currentIndex = index;
        this.$refs.tabControl2.currentIndex = index;
      },
      backTop() {
        //父组件获取名为scroll的子组件对象
        // this.$refs.scroll.bScroll.scrollTo(0, 0, 500)
        //拿到scroll子组件后，直接调用组件封装的backTop()，而不是拿到组件内bScroll对象后再调用对象的scrollTo()
        this.$refs.scroll.scrollTo(0, 0, 500);
      },
      contentScroll(position) {
        this.isShowBackTop = (-position.y) > 1000 ? true : false
        this.isFixed = -position.y > this.tabOffsetTop ? true : false
      },
      loadMore() {
        this.getHomeGoods(this.currentType);
        this.$refs.scroll.finishPullUp()
      },
      swiperImageLoad() {
        //因为组件是没有offsetTop属性的，只要元素才有，所以先通过$el就可以拿到组件内部的元素
        this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;
      },


      /**
       * 网络请求相关的方法
       */
      getHomeMultiData() {
        getHomeMultiData().then(res => {
          this.banners = res.data.banner.list;
          this.recommends = res.data.recommend.list;
        })
      },
      getHomeGoods(type) {
        let page = this.goods[type].page += 1
        getHomeGoods(type, page).then(res => {
          this.goods[type].list.push(...res.data.list);
          this.goods[type].page = page
        })
      }
    }
  }
</script>

<style scoped>
  #home {
    /*padding-top: 44px;*/
    position: relative;
    height: 100vh; /*100%视口 viewpoint height ,由于内容把home整体都撑高了，所以需要一个固定高度*/
  }

  .home-nav {
    background-color: var(--color-tint);
    color: #fff;
    width: 100%;
    /*better-scroll可以实现局部滚动，所以nanbar也不需要固定*/
    /*position: fixed;
    z-index: 9;
    left: 0;
    right: 0;
    top: 0;*/
  }

  .tab-control {
    position: sticky;
    top: 44px;
    z-index: 9;
  }

  .scroll-content {
    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
    overflow: hidden;
  }

  /*.scroll-content {
    height: calc(100% - 93px); !*css3中计算div长度值，减去上下高度就是要滚动的高度*!
    overflow: hidden;
    margin-top: 44px;
  }*/

  .tab-control-fixed {
    position: fixed;
    left: 0;
    right: 0;
    top: 44px;
  }
</style>
