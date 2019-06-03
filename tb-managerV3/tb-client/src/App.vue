<style>
* {
  font-size: 14px;
}
</style>

<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      routName: ""
    };
  },
  mounted() {
    this.routName = this.$route.name;
  },
  updated() {
    this.routName = this.$route.name;
  }
};
</script>



