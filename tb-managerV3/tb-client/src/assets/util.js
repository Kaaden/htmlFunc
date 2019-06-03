import $ from "jquery";
import http from "web-http-kaaden";
const host = "https://nextapi.jishutuan.com" //线上
// const host = "http://localhost:9090"; //本地
const addr = {
  login: host + "/login",
  build: host + "/build",
  buildRecord: host + "/buildRecord",
  buildDel: host + "/buildDel",
  buildUpdate: host + "/buildUpdate",
  register: host + "/register",
  loginLst: host + "/loginLst",
  updateMoney: host + "/updateMoney",
  loginCheck: host + "/loginCheck",
  wangwangLst: host + "/wangwangLst",
  searchRecord: host + "/searchRecord",
  fifterRecord: host + "/fifterRecord",
  updateTime: host + "/updateTime",
  searchAccount: host + "/searchAccount",
  updateFunc: host + "/updateFunc",
  updatePassword: host + "/updatePassword",
  accountDel: host + "/accountDel",
  tbSkulst: host + "/tbSkulst"
};
const tools = {
  sessionSet(name, data) {
    window.sessionStorage.setItem(name, data);
  },
  sessionGet(name) {
    return window.sessionStorage.getItem(name);
  },
  goNewPage(url, target) {
    target.$router.push(url);
  },
  goBack(target) {
    target.$route.back(-1);
  },
  showError(msg, target) {
    target.$message.error(msg);
  },
  showSuccess(msg, target) {
    target.$message({
      message: msg,
      type: "success"
    });
  },
  fontSize() {
    var deviceWidth = $(document).width();
    if (deviceWidth > 1920) {
      deviceWidth = 1920;
    }
    var fontSize = deviceWidth / 19.2;
    $("html").css("fontSize", fontSize);
    console.log(fontSize);
  },
  // 重置
  reset(object) {
    Object.assign(object, {
      password: "",
      passwordshow: false,
      wangIndex: 1,
      editShow: false,
      pageindex: 1,
      mark: "",
      coupon: "",
      typeLst: [],
      searchLink: "",
      productLink: "",
      jumpLink: "",
      coupShow: false,
      autoBuyShow: false,
      recordLst: [],
      recordNum: 1,
      showWang: false,
      wangLst: [],
      wangNum: 1,
      date: tools.sessionGet("date"),
      name: tools.sessionGet("account"),
      func: JSON.parse(tools.sessionGet("openType")),
      fenyeShow: false,
      selType: "",
      owneLst: []
    });
    return object;
  },
  //选择生成日期
  timeCover(timestamp, time) {
    timestamp = timestamp + time;
    let date = new Date(timestamp);
    let [year, month, day] = [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    ];
    return year + "-" + month + "-" + day;
  },
  //日期
  timeDate() {
    let timestamp = new Date().getTime();
    let time = {
      td1: tools.timeCover(timestamp, 24 * 60 * 60 * 1000), //一天
      td2: tools.timeCover(timestamp, 3 * 24 * 60 * 60 * 1000), //3天
      td3: tools.timeCover(timestamp, 31 * 24 * 60 * 60 * 1000), //一个月
      td4: tools.timeCover(timestamp, 91.25 * 24 * 60 * 60 * 1000), //一季度
      td5: tools.timeCover(timestamp, 182.5 * 24 * 60 * 60 * 1000), //半年
      td6: tools.timeCover(timestamp, 365 * 24 * 60 * 60 * 1000) //一年
    };
    return time;
  },
  // 数组去重
  arrayExp(array) {
    let len = array.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        if (array[i] == array[j]) {
          array.splice(j, 1);
          len--;
          j--;
        }
      }
    }
    return array;
  }
};
$(window).resize(function () {
  tools.fontSize();
});
const core = {
  //登录
  Login(vm) {
    return http.post(addr.login, {
      account: vm.account,
      password: vm.password
    });
  },
  //生成
  Build(vm, target) {
    http
      .post(addr.build, {
        isCart: vm.isCart,
        goodPage: vm.goodPage,
        isWang: vm.isWang,
        isCoupon: vm.isCoupon,
        isFollow: vm.isFollow,
        couponPage: vm.couponPage,
        landingPage: vm.landingPage,
        mark: vm.mark,
        owner: vm.owner,
        ownername: vm.ownername,
        skuids: vm.skuids,
        skuName: vm.skuName
      })
      .then(data => {
        if (data.isok) {
          tools.showSuccess(data.msg, target);
          target.vm = tools.reset(target.vm);
          target.vmSku.checkList = [];
          target.vmSku.lst = [];
          target.vmSku.skuids = [];
          target.vmSku.btnUse = false;
          target.vmSku.show = false;
        } else {
          tools.showError(data.msg, target);
        }
      });
  },
  async BuildRecord(pageindex, target, del) {
    let info = await http.post(addr.buildRecord, {
      type: tools.sessionGet("accountType"),
      id: tools.sessionGet("ids"),
      pageindex,
      pagesize: 10
    });
    if (info.isok) {
      target.vmSku.checkList = [];
      target.vmSku.lst = [];
      target.vmSku.skuids = [];
      target.vmSku.btnUse = false;
      target.vmSku.show = false;
      target.vm.recordLst = info.lst;
      target.vm.recordNum = info.num;
      target.activeName2 = "second";
      let array = [];
      for (let i = 0, len = info.lst.length; i < len; i++) {
        info.lst[i].newLink =
          "https://sfans.ews.m.jaeapp.com/next-follow/index.php?id=" +
          info.lst[i].id;
        array.push(info.lst[i].ownername);
      }
      target.vm.owneLst = tools.arrayExp(array);
    } else {
      target.vm.recordLst = [];
      target.vm.recordNum = 1;
    }
    if (target.vm.recordLst.length === 0 && del) {
      pageindex = pageindex - 1;
      core.BuildRecord(pageindex, target, false);
    }
  },

  // 删除
  async BuildDel(id, target) {
    let info = await http.post(addr.buildDel, {
      id
    });
    if (info.isok) {
      tools.showSuccess(info.msg, target);
    } else {
      tools.showError(info.msg, target);
    }
  },
  // 更新
  BuildUpdate(vm, target) {
    http
      .post(addr.buildUpdate, {
        isCart: vm.isCart,
        goodPage: vm.goodPage,
        isWang: vm.isWang,
        isCoupon: vm.isCoupon,
        isFollow: vm.isFollow,
        couponPage: vm.couponPage,
        landingPage: vm.landingPage,
        mark: vm.mark,
        id: vm.owner,
        owner: tools.sessionGet("aid"),
        skuids: vm.skuids,
        skuName: vm.skuName
      })
      .then(data => {
        if (data.isok) {
          target.vm = tools.reset(target.vm);
          tools.showSuccess(data.msg, target);
          core.BuildRecord(target.vm.pageindex, target);
        } else {
          tools.showError(data.msg, target);
        }
      });
  },
  // 注册
  Register(vm, target) {
    let date = "";
    let openWang = 0,
      openCart = 0,
      openFollow = 0,
      openCoupon = 0;
    if (vm.date) {
      date = vm.date
        .toLocaleDateString()
        .split("/")
        .join("-");
    } else {
      date = vm.selDate;
    }
    if (vm.funcvalue.includes("关注收藏店铺")) {
      openFollow = 1;
    }

    if (vm.funcvalue.includes("自动领券")) {
      openCoupon = 1;
    }
    if (vm.funcvalue.includes("记录旺旺")) {
      openWang = 1;
    }
    if (vm.funcvalue.includes("自动加购收藏宝贝")) {
      openCart = 1;
    }
    http
      .post(addr.register, {
        date,
        openWang,
        openCart,
        openFollow,
        openCoupon,
        account: vm.account,
        password: vm.password,
        accountType: vm.accountType,
        money: vm.money,
        by_id: vm.aid,
        tbUserId: vm.tbUserId,
        shopId: vm.shopId,
        mark: vm.mark
      })
      .then(data => {
        if (data.isok) {
          target.register_info = Object.assign(target.register_info, {
            dialogRegi: false,
            account: "",
            password: "123456",
            date: "",
            shopId: "",
            accountType: "user",
            money: 0,
            Lst: [],
            num: 1,
            tbUserId: "",
            mark: "",
            selDate: ""
          });
          tools.showSuccess(data.msg, target);
        } else {
          tools.showError(data.msg, target);
        }
      });
  },
  // 账号列表信息
  async LoginLst(pageindex, target) {
    let info = await http.post(addr.loginLst, {
      type: tools.sessionGet("accountType"),
      id: tools.sessionGet("aid"),
      pageindex,
      pagesize: 9,
      sort: target.register_info.sort
    });

    if (info.isok) {
      for (let i = 0, len = info.lst.length; i < len; i++) {
        let tmp = "";

        if (info.lst[i].openWang == 1) {
          tmp = tmp + "+" + "记录旺旺";
        }
        if (info.lst[i].openCoupon == 1) {
          tmp = tmp + "+" + "自动领券";
        }
        if (info.lst[i].openFollow == 1) {
          tmp = tmp + "+" + "关注收藏店铺";
        }
        if (info.lst[i].openCart == 1) {
          tmp = tmp + "+" + "自动加购收藏宝贝";
        }
        info.lst[i].func = tmp;
      }
      target.register_info.Lst = info.lst;
      target.register_info.num = info.num;
      target.register_info.showPage = false;
      target.vmTd.showPay = false;
      target.vmTd.money = "";
    } else {
      target.register_info.Lst = [];
      target.register_info.num = 1;
      target.register_info.showPage = false;
    }
  },
  // 充值
  Recharge(vm, target) {
    http
      .post(addr.updateMoney, {
        id: vm.id,
        money: vm.money
      })
      .then(data => {
        if (data.isok) {
          tools.showSuccess(data.msg, target);
          setTimeout(async () => {
            await core.LoginLst(target.register_info.pageindex, target);
          }, 1000);
        } else {
          tools.showError(data.msg, target);
        }
      });
  },
  // 注册账号检测
  CheckLogin(name, target) {
    http
      .post(addr.loginCheck, {
        account: name
      })
      .then(data => {
        if (data.isok) {
          target.register_info.showDanger = true;
        } else {
          target.register_info.showDanger = false;
        }
      });
  },

  //旺旺列表
  async WangLst(vm, target) {
    let info = await http.post(addr.wangwangLst, {
      urlsId: vm.urlsId,
      pageindex: vm.pageindex,
      pagesize: vm.pagesize
    });
    if (info.isok) {
      target.vm.wangLst = info.lst;
      target.vm.wangNum = info.num;
    } else {
      target.vm.wangLst = [];
      target.vm.wangNum = 1;
    }
  },
  // 搜索
  SearchRecord(vm, target) {
    http
      .post(addr.searchRecord, {
        ids: tools.sessionGet("ids"),
        searchLink: vm.searchLink,
        pageindex: vm.pageindex,
        pagesize: 10,
        type: tools.sessionGet("accountType")
      })
      .then(data => {
        if (data.isok) {
          let array = [];
          for (let i = 0, len = data.lst.length; i < len; i++) {
            data.lst[i].newLink =
              "https://sfans.ews.m.jaeapp.com/next-follow/index.php?id=" +
              data.lst[i].id;
            array.push(data.lst[i].ownername);
          }
          target.vm.recordLst = data.lst;
          target.vm.recordNum = data.num;
        } else {
          target.vm.recordLst = [];
          target.vm.recordNum = 1;
        }
      });
  },
  // 根据类型筛选生成记录
  FifterRecord(vm, target) {
    http.post(addr.fifterRecord, {
      ids: tools.sessionGet("ids"),
      isCart: vm.isCart,
      isWang: vm.isWang,
      isCoupon: vm.isCoupon,
      isFollow: vm.isFollow,
      type: tools.sessionGet("accountType"),
      pageindex: vm.pageindex,
      pagesize: 10
    }).then(data => {
      if (data.isok) {
        let array = [];
        for (let i = 0, len = data.lst.length; i < len; i++) {
          data.lst[i].newLink = "https://sfans.ews.m.jaeapp.com/next-follow/index.php?id=" + data.lst[i].id;
          array.push(data.lst[i].ownername);
        }
        target.vm.recordNum = data.num;
        target.vm.recordLst = data.lst;
      } else {
        target.vm.recordLst = [];
        target.vm.recordNum = 1;
      }
    });
  },

  // 更新到期日期
  UpdateTime(vm, target) {
    http
      .post(addr.updateTime, {
        id: vm.id,
        exp: vm.exp
      })
      .then(data => {
        if (data.isok) {
          tools.showSuccess(data.msg, target);
          setTimeout(async () => {
            await core.LoginLst(target.register_info.pageindex, target);
            target.vmTd.showPay = false;
            target.vmTd.showDate = false;
            target.vmTd.date = "";
            target.vmTd.selDate = "";
            target.vmTd.money = "";
          }, 1000);
        } else {
          tools.showError(data.msg, target);
        }
      });
  },
  //搜索账号
  SearchAccount(username, target) {
    http
      .post(addr.searchAccount, {
        ids: tools.sessionGet("ids"),
        type: tools.sessionGet("accountType"),
        username
      })
      .then(data => {
        target.register_info.showPage = true;
        if (data.isok) {
          for (let i = 0, len = data.lst.length; i < len; i++) {
            // if (data.list[i].exp.includes(""))
            let tmp = "";
            if (data.lst[i].openCart == 1) {
              tmp = "自动加购收藏宝贝";
            }
            if (data.lst[i].openWang == 1) {
              tmp = tmp + "+" + "记录旺旺";
            }
            if (data.lst[i].openCoupon == 1) {
              tmp = tmp + "+" + "自动领券";
            }
            if (data.lst[i].openFollow == 1) {
              tmp = tmp + "+" + "关注收藏店铺";
            }
            data.lst[i].func = tmp;
          }
          target.register_info.Lst = data.lst;
        } else {
          target.register_info.Lst = [];
        }
      });
  },
  //更新功能
  UpdateFunc(vm, target) {
    http
      .post(addr.updateFunc, {
        id: vm.id,
        openCart: vm.openCart,
        openCoupon: vm.openCoupon,
        openFollow: vm.openFollow,
        openWang: vm.openWang
      })
      .then(data => {
        if (data.isok) {
          tools.showSuccess(data.msg, target);
          setTimeout(async () => {
            await core.LoginLst(target.register_info.pageindex, target);
            target.vmTd.showPay = false;
            target.vmTd.showDate = false;
            target.vmTd.funcshow = false;
            target.vmTd.date = "";
            target.vmTd.selDate = "";
            target.vmTd.money = "";
            target.vmTd.funcvalue = [];
          }, 1000);
        } else {
          tools.showError(data.msg, target);
        }
      });
  },
  //修改密码
  UpdatePassword(vm, target) {
    http
      .post(addr.updatePassword, {
        id: vm.id,
        password: vm.password
      })
      .then(data => {
        if (data.isok) {
          tools.showSuccess(data.msg, target);
          target.vm.password = "";
          target.vm.passwordshow = false;
        } else {
          tools.showError(data.msg, target);
        }
      });
  },
  // 删除账号
  AccountDel(id, target) {
    http
      .post(addr.accountDel, {
        id
      })
      .then(async data => {
        if (data.isok) {
          tools.showSuccess(data.msg, target);
          if (Number(target.register_info.pageindex) == 0) {
            target.register_info.pageindex = 1;
          }
          await core.LoginLst(target.register_info.pageindex, target);
        } else {
          tools.showError(data.msg, target);
        }
      });
  },
  // 根据加购链接获取规格
  tbSku(url, target) {
    http
      .post(addr.tbSkulst, {
        url,
        id: tools.sessionGet("aid")
      })
      .then(data => {
        if (data.isok) {
          target.vmSku.lst = data.sku;
          target.vmSku.show = true;
          target.vmSku.btnUse = false
        } else {
          target.vmSku.show = false;
          if (data.msg.includes("加购宝贝不属于您店铺")) {
            tools.showError(data.msg, target);
            target.vmSku.btnUse = true;
          }
        }
        target.loading = false;
      });
  }
};
export { tools, addr, core };
