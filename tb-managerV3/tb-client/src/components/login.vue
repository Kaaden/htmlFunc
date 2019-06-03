<style scoped lang="less">
.wrap {
  width: 100%;
  height: 100vh;
  background-color: #458fd2;
}
.pop {
  width: 6rem;
  height: 4.5rem;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  top: 10%;
  left: 50%;
  margin-left: -3rem;
  .pop-title {
    font-size: 0.3rem;
    color: #458fd2;
    text-align: center;
    margin-top: 0.5rem;
  }
  .pop-main {
    width: 100%;
    padding: 0 0.3rem;
    margin-top: 0.5rem;
    .pop-main-btn {
      width: 5rem;
      height: 0.6rem;
      margin-top: 1rem;
      position: absolute;
      bottom: 10%;
      left: 50%;
      margin-left: -2.5rem;
      background-color: #458fd2 !important;
    }
  }
}
</style>

<template>
<div class="wrap">
  <div class="pop f fv">
    <div class="pop-title">店铺登录 V2</div>
    <div class="pop-main rel f1">
        <el-input
        :clearable="true"
    placeholder="账号"
    v-model="account">
    <i slot="prefix" class="el-input__icon dzicon icon-wode" style="font-size:0.25rem"/>
  </el-input>
      <el-input class="pop-main-input"
      placeholder="密码"
      :clearable="true"
      v-model="password" type="password" style="margin-top:0.3rem">
      <i slot="prefix" class="el-input__icon el-icon-info" />
    </el-input>
     <el-button type="primary" class="pop-main-btn" @click="login" :loading="showLoading">登陆</el-button>
    </div>
  </div>
  </div>
</template>

<script>
import { tools, core } from "@/assets/util.js";
export default {
  name: "login",
  data() {
    return {
      account: "",
      password: "",
      showLoading: false
    };
  },
  watch: {},
  methods: {
    login() {
      if (this.account == "" && this.password == "") {
        tools.showError("请输入账号或密码", this);
        return;
      }
      let vm = {
        account: this.account,
        password: this.password
      };
      this.showLoading = true;
      core.Login(vm).then(data => {
        if (data.isok) {
          tools.sessionSet("aid", data.id);
          tools.sessionSet("accountType", data.accountType);
          tools.sessionSet("date", data.date);
          tools.sessionSet("account", data.account);
          tools.sessionSet("ids", data.ids);
          tools.sessionSet("openType", JSON.stringify(data.open));
          tools.goNewPage("/index", this);
        } else {
          tools.showError("账号或密码错误", this);
        }
        this.showLoading = false;
      });
    }
  },
  created: function() {
    let that = this;
    document.onkeydown = function(e) {
      var key = window.event.keyCode;
      if (key === 13) {
        that.login();
      }
    };
  },
  mounted() {
    tools.fontSize();
  }
};
</script>


