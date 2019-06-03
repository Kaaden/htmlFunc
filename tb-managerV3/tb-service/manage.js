const sql = require("./sql");
const iconv = require("iconv-lite");
const request = require("request-promise");
const cheerio = require("cheerio");
require("events").EventEmitter.prototype._maxListeners = 100;
//去空格
function trim(str) {
  return str.replace(/^(\s|\u00A0)+/, "").replace(/(\s|\u00A0)+$/, "");
}
// 代理请求
let proxy = { host: null, time: null };
async function getProxy() {
  // 如果无代理ip，或者 代理IP 已使用30秒以上 ，则获取新的代理ip
  if (!proxy.host || proxy.time + 30 * 1000 < Date.now()) {
    var result = await request.get(
      "http://piping.mogumiao.com/proxy/api/get_ip_al?appKey=2b69d889c077412db698c407ca1250ca&count=1&expiryDate=0&format=1&newLine=2"
    );
    result = JSON.parse(result);
    console.log(result)
    proxy["host"] = `http://${result["msg"][0]["ip"]}:${
      result["msg"][0]["port"]
      }`;
    proxy["time"] = Date.now();
  }
  return proxy["host"];

}
async function axios(url) {
  return await request.get(url, {
    encoding: null,
  });
  // let ip = await getProxy();
  // try {
  //   const data = await request.get(url, {
  //     proxy: ip,
  //     encoding: null,
  //   });
  //   console.log(data);
  //   return data;
  // } catch (err) {
  //   proxy = { host: null, time: null };
  //   ip = await getProxy();
  //   return await request.get(url, {
  //     proxy: ip,
  //     encoding: null,
  //     timeout:500
  //   });
  // }
}
async function getUserId(html) {
  if (!html) return null;
  //从页面 html 中 查找
  let match;
  match = html.match(/"userId":[0-9]+/);
  if (match) return match[0].slice(9);
  match = html.match(/"userid":[0-9]+/);
  if (match) return match[0].slice(9);
  match = html.match(/userId=[0-9]+/);
  if (match) return match[0].slice(7);
  return null;
}
async function getHtml(goodPage) {
  var bufs = await axios(goodPage);
  if (!bufs) return;
  bufs = iconv.decode(bufs, "gb2312");
  //转为utf8
  const html = bufs.toString("utf8");
  return html;
}
async function getUserIdAndSkuIds(html, goodPage) {
  const $ = cheerio.load(html);
  const value2label = {};
  $(".J_TSaleProp li").each(function (i, elem) {
    const value = $(this).attr("data-value");
    const label = $(this)
      .find("span")
      .text();
    value2label[value] = label;
  });
  // 预定义结果 skuList = [{name,skuId,stock},{name,skuId,stock}]
  const skuList = [];
  let skuMaps;
  if (/item.taobao.com/.test(goodPage)) {
    skuMaps = html.match(/skuMap[\s]+:[\s]+{[\S]+[\s]+,propertyMemoMap/);
    if (skuMaps) {
      skuMaps = trim(skuMaps[0]);
      skuMaps = skuMaps.slice(13, -16);
      skuMaps = JSON.parse(skuMaps);
    }
  }
  if (/detail.tmall.com/.test(goodPage)) {
    skuMaps = html.match(/"skuMap":{[\S]+,"salesProp"/);
    if (skuMaps) {
      skuMaps = JSON.parse(skuMaps[0].slice(9, -12));
    }
  }
  if (skuMaps) {
    Object.keys(skuMaps).map(key => {
      const keyArray = key.split(";");
      let name = "";
      keyArray.map(i => {
        if (value2label[i]) name += value2label[i] + " ";
      });
      skuList.push({
        name,
        skuId: skuMaps[key].skuId,
        stock: skuMaps[key].stock
      });
    });
    return skuList;
  }
  return [];
}
function typeEx(tmp) {
  if (tmp.isWang === 1) {
    tmp.type = "旺旺";
  }
  if (tmp.isCart === 1) {
    tmp.type = tmp.type + "+" + "加购";
  }
  if (tmp.isCoupon === 1) {
    tmp.type = tmp.type + "+" + "优惠券";
  }
  if (tmp.isFollow === 1) {
    tmp.type = tmp.type + "+" + "关注";
  }
  return tmp;
}
//截取加购宝贝id
function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  let para = decodeURIComponent(results[2].replace(/\+/g, " "));
  para = trim(para);
  return para;
}
// 截取优惠券链接iD
function getCounpParameter(url) {
  if (url) {
    let ids = [];
    url = url.split("&");
    for (let i = 0, len = url.length; i < len; i++) {
      if (url[i].startsWith("activityId")) {
        ids = url[i];
      }
    }
    ids = ids.split("=");
    return ids[1];
  } else {
    return "";
  }
}
function resJosn(vm, res) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(vm));
}
exports.test = async function (req, res) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  res.end(
    JSON.stringify({
      error: 0,
      str: "str"
    })
  );
};
// 登陆验证
exports.login = function (req, res) {
  let vm = {};
  let sqlite = "SELECT * FROM account Where username=" + '"' + req.body.account + '"' + " and password=" + '"' + req.body.password + '"';
  sql.query(sqlite).then(async data => {
    if (data.length) {
      let ld = data[0]
      let tmp = await sql.query("SELECT id FROM account Where top_id=" + '"' + ld.id + '"')
      let ids = [];
      ids.push(ld.id);
      vm.isok = true;
      vm.msg = "查找到数据";
      vm.id = ld.id;
      vm.account = ld.username;
      vm.accountType = ld.type;
      vm.open = {
        openWang: ld.openWang,
        openCart: ld.openCart,
        openFollow: ld.openFollow,
        openCoupon: ld.openCoupon
      };
      let d = new Date(ld.exp);
      vm.date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      tmp.map(item => { ids.push(item.id) })
      vm.ids = ids;
    } else {
      vm.isok = false;
      vm.msg = "您输入的帐号或者密码不正确，请重新输入。";
    }
    resJosn(vm, res)
  });
};
//检测账号名
exports.loginCheck = function (req, res) {
  let vm = {};
  let sqlite = "SELECT * FROM account Where username=" + '"' + req.body.account + '"';
  sql.query(sqlite).then(data => {
    if (data.length) {
      vm.isok = true;
      vm.msg = "已有账号请重新输入";
    } else {
      vm.isok = false;
      vm.msg = "账号可注册";
    }
    resJosn(vm, res)
  });
};

exports.tbSkulst = async function (req, res) {
  let vm = {};
  let url = req.body.url;
  let account = await sql.query("SELECT * FROM account WHERE id = " + req.body.id);
  let html = await getHtml(url);
  const userId = await getUserId(html);
  const tbUserId = account[0]["userId"];
  if (userId != tbUserId) {
    vm.isok = false;
    vm.msg = "服务器繁忙或加购宝贝不属于您店铺，却确认后重试";
    resJosn(vm, res)
    return;
  }
  let skulst = await getUserIdAndSkuIds(html, url);
  if (skulst && skulst.length) {
    vm.isok = true;
    vm.msg = "查找到数据";
    vm.sku = skulst;
  } else {
    vm.isok = false;
    vm.msg = "暂无数据";
    vm.sku = [];
  }
  resJosn(vm, res)
};
//生成
exports.build = async function (req, res) {
  let vm = {};
  let reb = req.body;
  let addSql = "INSERT INTO urls(isWang,isCoupon,isCart,isFollow,goodPage,couponPage,landingPage,mark,owner,ownername,skuids,itemId,activityId,skuName) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const account = await sql.query("SELECT * FROM account WHERE id = " + reb.owner);
  if (reb.isCoupon && reb.isCoupon != 0 && !reb.couponPage.includes(account[0]["userId"])) {
    vm.isok = false;
    vm.msg = "该优惠券不属于本店铺";
    resJosn(vm, res)
    return;
  }
  let itemId = getParameterByName("id", reb.goodPage);
  let activityId = getCounpParameter(reb.couponPage);
  let addSqlParams = [
    reb.isWang,
    reb.isCoupon,
    reb.isCart,
    reb.isFollow,
    trim(reb.goodPage),
    trim(reb.couponPage),
    trim(reb.landingPage),
    reb.mark,
    reb.owner,
    reb.ownername,
    reb.skuids,
    itemId,
    activityId,
    reb.skuName
  ];
  sql.insert(addSql, addSqlParams).then(data => {
    if (data) {
      vm.isok = true;
      vm.msg = "添加成功";
    } else {
      vm.isok = false;
      vm.msg = "添加失败";
    }
    resJosn(vm, res)
  });
};



const addWangTask = async function (query) {
  const { username, urlId, ip } = query;
  let checkSql = "SELECT * FROM wang Where username=" + '"' + username + '"' + " and urlId=" + '"' + urlId + '"';
  let checkWang = await sql.query(checkSql);
  if (checkWang.length) {
    let updateSql = "UPDATE wang SET click=?,ip=? WHERE id=?";
    let updateSqlParams = [checkWang[0]["click"] + 1, ip, checkWang[0]["id"]];
    await sql.insert(updateSql, updateSqlParams);
  } else {
    let addSql = "INSERT INTO wang(ip,updateAt,urlId,username,click) VALUES(?,?,?,?,?)";
    let addSqlParams = [ip, new Date(), urlId, username, 1];
    await sql.insert(addSql, addSqlParams);
  }
};

//生成旺旺
exports.addWang = async function (req, res) {
  addWangTask(req.query);
  let vm = {};
  vm.isok = true;
  vm.msg = "成功";
  resJosn(vm, res)
};

// 生成记录列表
exports.buildRecord = function (req, res) {
  let reb = req.body;
  let sqlite = "SELECT * FROM urls Where owner in" + "(" + reb.id + ")" + " ORDER BY updateAt DESC" + " Limit " + (reb.pageindex - 1) * reb.pagesize + "," + reb.pagesize;
  let sqlength = "SELECT COUNT(*) From urls where owner in" + "(" + reb.id + ")";
  if (reb.type === "admin") {
    sqlite = "SELECT * FROM urls" + " ORDER BY updateAt DESC" + " Limit " + (reb.pageindex - 1) * reb.pagesize + "," + reb.pagesize;
    sqlength = "SELECT COUNT(*) From urls";
  }
  sql.queryLst(sqlite, sqlength).then(data => {
    for (let i = 0, len = data.lst.length; i < len; i++) {
      data.lst[i].type = "";
      data.lst[i] = typeEx(data.lst[i]);
    }
    resJosn(data, res)
  });
};
//删除记录
exports.buildDel = async function (req, res) {
  let vm = {};
  let delSql = "DELETE FROM wangwang where urlsId=" + req.body.id;
  let delSql2 = "DELETE FROM urls where id=" + req.body.id;
  await sql.query(delSql)
  let tm = await sql.query(delSql2)
  if (tm) {
    vm.isok = true;
    vm.msg = "删除成功";
  } else {
    vm.isok = false;
    vm.msg = "删除失败";
  }
  resJosn(vm, res)

};
//修改记录
exports.buildUpdate = async function (req, res) {
  let vm = {};
  let reb = req.body;
  let updateSql = "UPDATE urls SET isWang=?,isCoupon=?,isCart=?,isFollow=?,goodPage=?,couponPage=?,landingPage=?,mark=?,skuids=?,itemId=?,activityId=?,skuName=? WHERE Id=?";
  const account = await sql.query("SELECT * FROM account WHERE id = " + reb.owner);
  if (reb.isCoupon && reb.isCoupon != 0 && !reb.couponPage.includes(account[0]["userId"])) {
    vm.msg = "该优惠券不属于本店铺";
    vm.isok = false;
    resJosn(vm, res)
    return;
  }
  let itemId = getParameterByName("id", reb.goodPage);
  let activityId = getCounpParameter(reb.couponPage);
  let updateSqlParams = [
    reb.isWang,
    reb.isCoupon,
    reb.isCart,
    reb.isFollow,
    trim(reb.goodPage),
    trim(reb.couponPage),
    trim(reb.landingPage),
    reb.mark,
    reb.skuids,
    itemId,
    activityId,
    reb.skuName,
    reb.id
  ];
  sql.insert(updateSql, updateSqlParams).then(data => {
    if (data) {
      vm.isok = true;
      vm.msg = "更新成功";
    } else {
      vm.isok = false;
      vm.msg = "更新失败";
    }
    resJosn(vm, res)
  });
};
//注册
exports.register = function (req, res) {
  let vm = {};
  let reb = req.body;
  let now = new Date();
  let retime = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + "  " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
  let addSql = "INSERT INTO account(username,password,exp,type,cash,top_id,userId,openWang,openCart,openFollow,openCoupon,mark,createdAt,shopId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let addSqlParams = [
    reb.account,
    reb.password,
    reb.date,
    reb.accountType,
    reb.money,
    reb.by_id,
    reb.tbUserId,
    reb.openWang,
    reb.openCart,
    reb.openFollow,
    reb.openCoupon,
    reb.mark,
    retime,
    reb.shopId
  ];
  sql.insert(addSql, addSqlParams).then(data => {
    if (data) {
      vm.isok = true;
      vm.msg = "开通成功";
    } else {
      vm.isok = false;
      vm.msg = "开通失败";
    }
    resJosn(vm, res)
  });
};
//账号列表信息
exports.loginLst = function (req, res) {
  let reb = req.body;
  let timeStam = reb.sort ? " exp " + reb.sort : "createdAt desc";
  let sqlite = "SELECT * FROM account Where top_id=" + '"' + reb.id + '"' + " ORDER BY " + timeStam + " Limit " + (reb.pageindex - 1) * reb.pagesize + "," + reb.pagesize;
  let sqlength = "SELECT COUNT(*) From account where top_id=" + reb.id;
  if (reb.type === "admin") {
    sqlite = "SELECT * FROM account" + " ORDER BY " + timeStam + " Limit " + (reb.pageindex - 1) * reb.pagesize + "," + reb.pagesize;
    sqlength = "SELECT COUNT(*) From account";
  }
  sql.queryLst(sqlite, sqlength).then(data => {
    for (let i = 0, len = data.lst.length; i < len; i++) {
      let d = new Date(data.lst[i].exp);
      data.lst[i].date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    }
    resJosn(data, res)
  });
};

//充值
exports.updateMoney = async function (req, res) {
  let vm = {};
  let reb = req.body;
  let sqlite = "SELECT * FROM account Where Id=" + '"' + reb.id + '"';
  let query = await sql.query(sqlite)
  if (query) {
    let money = Number(query[0].cash) + Number(reb.money);
    let updateSql = "UPDATE account SET cash=? WHERE Id=?";
    let updateSqlParams = [money, reb.id];
    sql.insert(updateSql, updateSqlParams).then(tmp => {
      if (tmp) {
        vm.isok = true;
        vm.msg = "充值成功";
      } else {
        vm.isok = false;
        vm.msg = "充值失败";
      }
      resJosn(vm, res)
    });
  }

};
//查看旺旺列表
exports.wangwangLst = function (req, res) {
  let reb = req.body;
  let sqlite = "SELECT * FROM wang Where urlId=" + '"' + reb.urlsId + '"' + " ORDER BY updateAt DESC" + " Limit " + (reb.pageindex - 1) * reb.pagesize + "," + reb.pagesize;
  let sqlength = "SELECT COUNT(*) From wang where urlId=" + reb.urlsId;

  sql.queryLst(sqlite, sqlength).then(data => {
    for (let i = 0, len = data.lst.length; i < len; i++) {
      let d = new Date(data.lst[i].updateAt);
      data.lst[i].updateAt = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "  " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    }
    resJosn(data, res)
  });
};

//搜索生成记录
exports.searchRecord = async function (req, res) {
  let vm = {};
  let reb = req.body;

  let sqlite = "SELECT * FROM URLS WHERE owner in" + '"' + reb.ids + '"' + "CONCAT(couponPage,landingPage,goodPage,Id,mark,ownername) LIKE" + '"%' + reb.searchLink + '%"';
  let sqlength = "SELECT COUNT(*) FROM URLS WHERE owner in" + '"' + reb.ids + '"' + "CONCAT(couponPage,landingPage,goodPage,Id,mark,ownername) LIKE" + '"%' + reb.searchLink + '%"';
  if (reb.type === "admin") {
    sqlite = "SELECT *  FROM URLS WHERE CONCAT(couponPage,landingPage,goodPage,Id,mark,ownername) LIKE" + '"%' + reb.searchLink + '%"';
    sqlength = "SELECT COUNT(*) FROM URLS WHERE CONCAT(couponPage,landingPage,goodPage,Id,mark,ownername) LIKE" + '"%' + reb.searchLink + '%"';
  }
  sqlite = sqlite + " Limit " + (reb.pageindex - 1) * reb.pagesize + "," + reb.pagesize;
  let count = await sql.query(sqlength);
  sql.query(sqlite).then(data => {
    if (data.length) {
      vm.isok = true;
      vm.msg = "查询成功";
      for (let i = 0, len = data.length; i < len; i++) {
        data[i].type = "";
        data[i] = typeEx(data[i]);
      }
      vm.num = count[0]["COUNT(*)"];
      vm.lst = data;
    } else {
      vm.isok = false;
      vm.msg = "查询失败";
      vm.lst = [];
      vm.num = 1;
    }
    resJosn(vm, res)
  });
};
//筛选类型
exports.fifterRecord = async function (req, res) {
  let vm = {};
  let fifterSql = ""
  let reb = req.body;

  let sqlength = "SELECT COUNT(*) From urls where owner in" + "(" + reb.ids + ")" + " and ";
  let sqlite = "SELECT * FROM urls Where owner in " + "(" + reb.ids + ")" + " and ";

  if (reb.type === "admin") {
    sqlite = "SELECT * FROM urls Where";
    sqlength = "SELECT COUNT(*) From urls Where";
  }
  if (reb.isWang === "1") {
    fifterSql = " isWang=" + '"' + reb.isWang + '"';
  }
  if (reb.isCoupon === "1") {
    fifterSql = " isCoupon=" + '"' + reb.isCoupon + '"';
  }
  if (reb.isFollow === "1") {
    fifterSql = " isFollow=" + '"' + reb.isFollow + '"';
  }
  if (reb.isCart === "1") {
    fifterSql = " isCart=" + '"' + reb.isCart + '"';
  }
  sqlength = sqlength + fifterSql
  sqlite = sqlite + fifterSql + " Limit " + (reb.pageindex - 1) * reb.pagesize + "," + reb.pagesize;
  let count = await sql.query(sqlength);
  sql.query(sqlite).then(data => {
    if (data.length) {
      vm.isok = true;
      vm.msg = "查询成功";
      for (let i = 0, len = data.length; i < len; i++) {
        data[i].type = "";
        data[i] = typeEx(data[i]);
      }
      vm.num = count[0]["COUNT(*)"];
      vm.lst = data;
    } else {
      vm.isok = false;
      vm.msg = "查询失败";
      vm.lst = [];
      vm.num = 0;
    }
    resJosn(vm, res)
  });
};

//搜索店铺
exports.searchOwn = function (req, res) {
  let vm = {};
  let reb = req.body;
  let sqlite =
    "SELECT * FROM urls Where ownername=" + '"' + reb.ownername + '"';
  sql.query(sqlite).then(data => {
    if (data.length) {
      vm.isok = true;
      vm.msg = "查询成功";
      for (let i = 0, len = data.length; i < len; i++) {
        data[i].type = "";
        data[i] = typeEx(data[i]);
      }
      vm.lst = data;
    } else {
      vm.isok = false;
      vm.msg = "查询失败";
      vm.lst = [];
    }
    resJosn(vm, res)
  });
};

//更新到期日期
exports.updateTime = function (req, res) {
  let vm = {};
  let reb = req.body;
  let updateSql = "UPDATE account SET exp=? WHERE Id=?";
  let updateSqlParams = [reb.exp, reb.id];
  sql.insert(updateSql, updateSqlParams).then(tmp => {
    if (tmp) {
      vm.isok = true;
      vm.msg = "更新成功";
    } else {
      vm.isok = false;
      vm.msg = "更新失败";
    }
    resJosn(vm, res)
  });
};
//筛选账号类型
exports.searchAccount = function (req, res) {
  let vm = {};
  let reb = req.body;

  let sqlite = "SELECT * FROM account WHERE top_id in" + "(" + reb.ids + ")" + "And CONCAT (username,exp) Like" + '"%' + reb.username + '%"';
  if (reb.type === "admin") {
    sqlite = "SELECT * FROM account Where CONCAT (username,exp) Like" + '"%' + reb.username + '%"';
  }
  sql.query(sqlite).then(data => {
    if (data.length) {
      vm.isok = true;
      vm.msg = "查询成功";
      for (let i = 0, len = data.length; i < len; i++) {
        let d = new Date(data[i].exp);
        data[i].date =
          d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      }
      vm.lst = data;
    } else {
      vm.isok = false;
      vm.msg = "查询失败";
      vm.lst = [];
    }
    resJosn(vm, res)
  });
};

//更新到期日期
exports.updateFunc = function (req, res) {
  let vm = {};
  let reb = req.body;
  let updateSql =
    "UPDATE account SET openCart=?,openCoupon=?,openFollow=?,openWang=? WHERE Id=?";
  let updateSqlParams = [
    reb.openCart,
    reb.openCoupon,
    reb.openFollow,
    reb.openWang,
    reb.id
  ];
  sql.insert(updateSql, updateSqlParams).then(tmp => {
    if (tmp) {
      vm.isok = true;
      vm.msg = "更新成功";
    } else {
      vm.isok = false;
      vm.msg = "更新失败";
    }
    resJosn(vm, res)
  });
};

//修改密码
exports.updatePassword = function (req, res) {
  let vm = {};
  let reb = req.body;
  let updateSql = "UPDATE account SET password=? WHERE Id=?";
  let updateSqlParams = [reb.password, reb.id];
  sql.insert(updateSql, updateSqlParams).then(tmp => {
    if (tmp) {
      vm.isok = true;
      vm.msg = "修改成功";
    } else {
      vm.isok = false;
      vm.msg = "修改失败";
    }
    resJosn(vm, res)
  });
};

//删除账号
exports.accountDel = async function (req, res) {
  let vm = {};
  let sqlite = "SELECT * FROM urls Where owner=" + '"' + req.body.id + '"';
  let urlsData = await sql.query(sqlite);
  let delSql = "DELETE FROM account where Id=" + req.body.id;
  let delSql2 = "DELETE FROM urls where owner=" + req.body.id;
  let delSql3 = "DELETE FROM wang where urlId=" + urlsData.id;
  await sql.query(delSql3)
  await sql.query(delSql2)
  let delaccount = await sql.query(delSql);
  if (delaccount) {
    vm.isok = true;
    vm.msg = "删除成功";
  } else {
    vm.isok = false;
    vm.msg = "删除失败";
  }
  resJosn(vm, res)
};
