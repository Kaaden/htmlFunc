<style scoped lang="less">
.wrap {
  width: 100%;
  background-color: #fff;
  .wrap-top {
    width: 100%;
    height: 0.8rem;
    background-color: #233a5a;
    color: #fff;
    padding: 0 0.3rem;
  }
  .wrap-main {
    padding: 0 0.3rem;
    width: 100%;
    .wrap-main-sel {
      margin-top: 0.3rem;
      .wrap-main-sel-item {
        padding: 0 0.3rem;
      }
      .wrap-main-sel-item2 {
        padding: 0.3rem 0;
        .wrap-main-sel-item2-search {
          width: 8rem;
          margin-bottom: 0.3rem;
        }
      }
      .wrap-main-item {
        width: 100%;
        margin-top: 0.3rem;
        > span {
          width: 1rem;
        }
      }
      .wrap-main-item-btn {
        margin-top: 0.3rem;
      }
    }
  }
  .sku-main {
    margin-top: 0.3rem;
  }
}
</style>
<template>
<div class="wrap">
  <div class="wrap-top f fc fj">
    <p>关注收藏店铺</p>
    <div>
     <span>账号：{{vm.name}}</span>
     <span style="margin-left:0.3rem">到期日期：{{vm.date}}</span>
     <span style="margin-left:0.3rem;cursor: pointer;" @click="changPassword">修改密码</span>
     <span @click="quitOut" style="cursor: pointer;margin-left:0.3rem">退出</span>
    </div>
  </div>
  <div class="wrap-main">

    <el-tabs class="wrap-main-sel" v-model="activeName2" type="card" @tab-click="handleClick" id="tabs" v-loading="loading">
      <!-- 生成 -->
      <el-tab-pane class="wrap-main-sel-item" label="生成链接" name="first">
        <div class="wrap-main-item f fc" v-if="vm.func.openFollow==1||vm.func.openCart==1||vm.func.openWang==1||vm.func.openCoupon==1">
          <span >功能：</span>
           <el-checkbox-group v-model="vm.typeLst" @change="handleSel">
            <el-checkbox label="关注收藏店铺" v-if="vm.func.openFollow==1"></el-checkbox>
            <el-checkbox label="自动加购收藏宝贝" v-if="vm.func.openCart==1"></el-checkbox>
            <el-checkbox label="记录旺旺" v-if="vm.func.openWang==1"></el-checkbox>
             <el-checkbox label="自动领券" v-if="vm.func.openCoupon==1"></el-checkbox>

          </el-checkbox-group>
        </div>
     
       <!-- 宝贝链接 -->
 	      <div class="wrap-main-item f fc" v-if="vm.autoBuyShow">
 	        <span>宝贝链接：</span>
          <el-input :clearable="true" v-model="vm.productLink" placeholder="请输入宝贝链接" class="f1" @input="goodPageChange"></el-input>
 		    </div>
         <!-- 规格 -->
         <div class="sku-main f fc" v-if="vmSku.show">
           <div style="width:1rem"></div>
           <el-tag style="margin-right:0.3rem">请选择规格</el-tag>
            <el-checkbox-group class="f1 f fc fw" v-model="vmSku.checkList"  @change="skuSel">
                <div  v-for="(item, index) in vmSku.lst">
                  <el-checkbox    :label="item.name+'/'+item.stock+'库存'" style="margin-right:0.1rem"></el-checkbox>
              </div>
            </el-checkbox-group>
         </div>
        <!-- 创建优惠券 -->
          <div class="wrap-main-item f fc"  v-if="vm.coupShow">
          <span>优惠券：</span>
         <el-input :clearable="true" v-model="vm.coupon" placeholder="请输入优惠券" class="f1"></el-input>
         
        </div>
        <div class="wrap-main-item f fc"  v-if="vm.coupShow">
          <span></span>
          <p style="font-size:12px;color:#888;">优惠券链接示例：https://taoquan.taobao.com/coupon/unify_apply.htm?sellerId=2062171698&activityId=5b748158d8794110b96b15d666b9c868</p>
        </div>


        <!-- 跳转链接 -->
        <div class="wrap-main-item f fc">
          <span>跳转链接：</span>
          <el-input :clearable="true" v-model="vm.jumpLink" placeholder="请输入跳转链接" class="f1"></el-input>
        </div>
        <div class="wrap-main-item f fc" >
          <span></span>
          <p style="font-size:12px;color:#888;">买家点击海报图片，关注收藏店铺领券后跳转到的页面，支持所有淘系链接，如：店铺首页，分类页，活动页，自动页，优惠券页，红包页，直播页</p>
        </div>

        <!-- 备注 -->
         <div class="wrap-main-item f fc">
          <span>备注：</span>
          <el-input :clearable="true" v-model="vm.mark" placeholder="请输入备注（可填）" class="f1"></el-input>
        </div>
        <div class="wrap-main-item f fc" >
          <span></span>
          <p style="font-size:12px;color:#888;">备注无特别要求，可填可不填，仅供自己识别链接</p>
        </div>

        <el-button type="primary"  :disabled="vmSku.btnUse" class="wrap-main-item-btn" @click="createInfo">{{vm.editShow?"修改":"生成链接"}}</el-button>
        <el-tag type="danger" style="margin-left:0.3rem">说明：将生成的链接放到详情页、店铺首页、活动首页、引导用户去点击，用户点击后即可实现所选功能！</el-tag>
      </el-tab-pane>

      <!-- 生成记录 -->
      <el-tab-pane class="wrap-main-sel-item2" label="生成记录" name="second">
        <div class="wrap-main-sel-item2-search f">
            <el-input :clearable="true" v-model="vm.searchLink" placeholder="请输入链接搜索、Id、备注" @input="searchWatch"></el-input>
            <el-button type="primary" style="margin-left:0.3rem" @click="searchRecord" >搜索</el-button>


              <el-select :clearable="true" v-model="vm.selType" placeholder="请选择类型" style="margin-left:0.3rem;width:5rem" @change="fifter" @clear="fifterClear">
                <el-option
 	                label="自动加购收藏宝贝"
 		                value="1"
 	                 v-if="vm.func.openCart==1">
 		              </el-option>
                   <el-option
                  label="关注收藏店铺"
                  value="2" v-if="vm.func.openFollow==1">
                </el-option>
                   <el-option
                  label="记录旺旺"
                  value="3" v-if="vm.func.openWang==1">
                </el-option>
                   <el-option
                  label="自动领券"
                  value="4" v-if="vm.func.openCoupon==1">
                </el-option>
              </el-select>
              
           
        </div>
          <el-table
              :data="vm.recordLst"
              border
              style="width: 100%"
              >
              <el-table-column
                prop="ownername"
                label="店铺"
              >
              </el-table-column>
              <el-table-column
                prop="mark"
                label="备注"
                width="80">
              </el-table-column>

              <el-table-column
                prop="type"
                label="类型"
                width="180">
              </el-table-column>
              <el-table-column
                prop="newLink"
                label="生成链接"
              >
              </el-table-column>
                <el-table-column
                prop="landingPage"
                label="跳转链接"
                >
              </el-table-column>
              <el-table-column
                  prop="goodPage"
 		              label="自动加购收藏宝贝">
 		            </el-table-column>
              <el-table-column
                prop="couponPage"
                label="优惠券"
                >
              </el-table-column>
            <el-table-column
                prop="skuName"
                label="规格"
                >
              </el-table-column>
              <el-table-column
                label="操作"
                width="120"
               >
                <template slot-scope="props">
                  <el-button type="text" size="small" @click="editItem(props.row)">修改</el-button>
                  <el-button type="text" size="small" @click="showWang(props.row)" v-if="props.row.isWang==1">查看旺旺</el-button>
                  <el-button @click="changeItem(props.row)" type="text" size="small">删除</el-button>
                </template>
            </el-table-column>
          </el-table>
            <el-pagination 
              style="margin-top:0.3rem"
              background
              layout="prev, pager, next"
              :total="vm.recordNum"
              :page-size="10"
              :current-page.sync='vm.pageindex'
              @current-change='pageindexChange'>
            </el-pagination>
      </el-tab-pane>
      <!-- 账号管理 -->
      <el-tab-pane class="wrap-main-sel-item" label="账号管理" name="third"  v-if="register_info.type!='user'">
            <el-button type="primary" @click="showDig" style="margin-top:0.15rem">账号开通</el-button>
              <div  class="f" style="margin-top:0.3rem">
                <el-input :clearable="true" v-model="register_info.searchaccount" placeholder="请输入账号名或到期日期" @input="searchAccountClear"></el-input>
                <el-button type="primary" style="margin-left:0.3rem" @click="searchAccount" >搜索</el-button>
              </div>
            <el-table
              :data="register_info.Lst"
              border
              style="width: 100%;margin-top:0.3rem"
              @sort-change='sortChange'
              >
              <el-table-column
                prop="username"
                label="用户"
                >
              </el-table-column>
            
              <el-table-column
                prop="password"
                label="密码"
                 width="100"
                >
              </el-table-column>
                <!-- <el-table-column
                prop="Sku"
                label="Sku">
              </el-table-column> -->
                <el-table-column
                prop="date"
                label="到期日期"
                sortable='custom'
                 >
              </el-table-column>
                <el-table-column
                prop="type"
                label="账号类型"
                width="250" >
              </el-table-column>
               <el-table-column
                prop="cash"
                label="金额"
                width="250">
              </el-table-column>

                <el-table-column
                prop="func"
                label="功能"
                width="250">
              </el-table-column>
                  <el-table-column
                prop="mark"
                label="备注"
                width="250">
              </el-table-column>

              <el-table-column
                fixed="right"
                label="操作"
                width="180">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="showDateDig(scope.row)">修改到期日期</el-button>
              <el-button type="text" size="small" @click="funcPop(scope.row)">修改功能</el-button>
               <el-button type="text" size="small" @click="payMoney(scope.row)" v-if="register_info.type=='admin'">充值</el-button>
                <el-button type="text" size="small" @click="delAccount(scope.row)" v-if="register_info.type=='admin'&&scope.row.id!=register_info.aid">删除</el-button>
            </template>
            </el-table-column>
          </el-table>
            <el-pagination
              v-if="register_info.showPage==false"
              style="margin:0.3rem 0 1rem 0"
              background
              layout="prev, pager, next"
              :total="register_info.num"
              :page-size="10"
               :current-page='register_info.pageindex'
              @current-change='accountChange'>
            </el-pagination>
      </el-tab-pane>
    </el-tabs>



    <!-- 开通账号弹框 -->
    <el-dialog title="账号注册" :visible.sync="register_info.dialogRegi">
        <el-form >
          <el-form-item label="账号名" >
            <el-tag type="danger" v-if="register_info.showDanger">账号名重复</el-tag>
            <el-input  :clearable="true" v-model="register_info.account" autocomplete="off" @input="checkName"></el-input>
          </el-form-item>
          <el-form-item label="密码" >
            <el-input :clearable="true" type="password" v-model="register_info.password" autocomplete="off"></el-input>
          </el-form-item>
         

          <el-form-item label="到期日期" >
            <el-date-picker
            format='yyyy-MM-dd'
              v-model="register_info.date"
              align="right"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions1" @change="dateChange">
            </el-date-picker>
            <el-radio-group v-model="register_info.selDate" style="margin-left:0.3rem" @change="selTime">
              <el-radio :label="register_info.selDateLst.td1">1天</el-radio>
              <el-radio :label="register_info.selDateLst.td2">3天</el-radio>
              <el-radio :label="register_info.selDateLst.td3">一个月</el-radio>
               <el-radio :label="register_info.selDateLst.td4">一季度</el-radio>
               <el-radio :label="register_info.selDateLst.td5">半年</el-radio>
               <el-radio :label="register_info.selDateLst.td6">一年</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="账号类型" >
              <el-radio-group v-model="register_info.accountType" style="margin-left:0.3rem" >
              <el-radio label="user" value="user">商家</el-radio>
              <el-radio label="agent" value="agent" v-if="register_info.type==='admin'">代理</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="功能开通" >
              <el-checkbox-group v-model="register_info.funcvalue">
                <el-checkbox label="关注收藏店铺" v-if="vm.func.openFollow==1"></el-checkbox>
                <el-checkbox label="自动加购收藏宝贝" v-if="vm.func.openCart==1"></el-checkbox>
                <el-checkbox label="记录旺旺" v-if="vm.func.openWang==1"></el-checkbox>
                <el-checkbox label="自动领券" v-if="vm.func.openCoupon==1"></el-checkbox>
              </el-checkbox-group>
          </el-form-item>

           <el-form-item label="用户id" v-if="register_info.accountType=='user'">
            <el-input :clearable="true"  v-model="register_info.tbUserId" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="店铺id" v-if="register_info.accountType=='user'">
            <el-input :clearable="true"  v-model="register_info.shopId" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="备注" >
            <el-input :clearable="true" v-model="register_info.mark" autocomplete="off"></el-input>
          </el-form-item>

         

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="registerClick(false)">取 消</el-button>
          <el-button type="primary" @click="registerClick(true)">确 定</el-button>
        </div>
    </el-dialog>

     <!-- 充值弹窗 -->
     <el-dialog title="充值" :visible.sync="vmTd.showPay" width="80%">
        <el-form >
          <el-form-item label="金额" >
            <el-input :clearable="true" v-model="vmTd.money" autocomplete="off"></el-input>
          </el-form-item>
         
         </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="reChage(false)">取 消</el-button>
          <el-button type="primary" @click="reChage(true)">确 定</el-button>
        </div>
    </el-dialog>
    <!-- 修改开通功能弹窗 -->
       <el-dialog title="功能修改" :visible.sync="vmTd.funcshow" width="80%">
        <el-form >
          <el-form-item >
               <el-checkbox-group v-model="vmTd.funcvalue">
                <el-checkbox label="关注收藏店铺" v-if="vm.func.openFollow==1||register_info.type=='admin'"></el-checkbox>
                 <el-checkbox label="自动加购收藏宝贝" v-if="vm.func.openCart==1||register_info.type=='admin'"></el-checkbox>
                <el-checkbox label="记录旺旺" v-if="vm.func.openWang==1||register_info.type=='admin'"></el-checkbox>
                <el-checkbox label="自动领券" v-if="vm.func.openCoupon==1||register_info.type=='admin'"></el-checkbox>
              </el-checkbox-group>
          </el-form-item>
         
         </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="updateFunc(false)">取 消</el-button>
          <el-button type="primary" @click="updateFunc(true)">确 定</el-button>
        </div>
    </el-dialog>
    <!-- 修改到期日期弹窗 -->
    <el-dialog title="修改到期日期" :visible.sync="vmTd.showDate" width="80%">
        <el-form >
          <el-form-item label="到期日期" >
             <el-date-picker
            format='yyyy-MM-dd'
              v-model="vmTd.date"
              align="right"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions1" @change="dateChange">
            </el-date-picker>
            <el-radio-group v-model="vmTd.selDate" style="margin-left:0.3rem" @change="selTime">
              <el-radio :label="vmTd.selDateLst.td1">1天</el-radio>
              <el-radio :label="vmTd.selDateLst.td2">3天</el-radio>
              <el-radio :label="vmTd.selDateLst.td3">一个月</el-radio>
               <el-radio :label="vmTd.selDateLst.td4">一季度</el-radio>
               <el-radio :label="vmTd.selDateLst.td5">半年</el-radio>
               <el-radio :label="vmTd.selDateLst.td6">一年</el-radio>
            </el-radio-group>
          </el-form-item>
         
         </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="reDateChange(false)">取 消</el-button>
          <el-button type="primary" @click="reDateChange(true)">确 定</el-button>
        </div>
    </el-dialog>

    <!-- 旺旺列表弹窗 -->
    <el-dialog title="查看旺旺" :visible.sync="vm.showWang">
      <el-table :data="vm.wangLst">
        <el-table-column property="username" label="旺旺号" width="150"></el-table-column>
        <el-table-column property="ip" label="IP地址" width="200"></el-table-column>
        <el-table-column property="updateAt" label="访问时间"></el-table-column>
         <el-table-column property="click" label="点击次数"></el-table-column>
      </el-table>
        <el-pagination
              style="margin-top:0.3rem"
              background
              layout="prev, pager, next"
              :total="vm.wangNum"
              :page-size="5"
              :current-page="vm.wangIndex"
              @current-change='wangwangChange'>
            </el-pagination>
    </el-dialog>

    <!-- 修改密码弹框 -->
      <el-dialog title="修改密码" :visible.sync="vm.passwordshow" width="80%">
        <el-form >
          <el-form-item  >
            <el-input :clearable="true" v-model="vm.password" autocomplete="off"></el-input>
          </el-form-item>
         
         </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="rePass(false)">取 消</el-button>
          <el-button type="primary" @click="rePass(true)">确 定</el-button>
        </div>
    </el-dialog>

  </div>
</div>
</template>

<script>
import { core, tools } from "@/assets/util.js";
export default {
  name: "index",
  data() {
    return {
      loading: false,
      activeName2: "first",
      vm: {
        password: "",
        passwordshow: false,
        wangIndex: 1,
        editShow: false,
        pageindex: 1,
        mark: "", //备注
        coupon: "", //优惠券
        typeLst: [], //类型
        typeLst: ["关注收藏店铺"], //类型
        searchLink: "", //链接搜索
        productLink: "", //宝贝链接
        jumpLink: "", //跳转链接
        coupShow: false, //控制优惠券显示
        coupShow: false, //控制优惠券显示
        autoBuyShow: false, //控制加购显示
        recordLst: [], //生成记录
        recordNum: 1, //生成总数
        showWang: false, //控制查看旺旺列表
        wangLst: [], //旺旺数据
        wangNum: 1, //旺旺列表总数
        date: tools.sessionGet("date"),
        name: tools.sessionGet("account"),
        func: JSON.parse(tools.sessionGet("openType")),
        selType: "", //类型筛选
        owneLst: [] //店铺
      },
      //注册信息
      register_info: {
        sort: "",
        funcvalue: [], //注册功能
        pageindex: 1,
        dialogRegi: false,
        searchaccount: "",
        account: "",
        password: "123456",
        date: "",
        selDate: "",
        accountType: "user",
        money: 0,
        Lst: [],
        num: 1,
        tbUserId: "", //用户id
        shopId: "", //店铺id
        type: tools.sessionGet("accountType"),
        aid: tools.sessionGet("aid"),
        showDanger: false,
        selDateLst: tools.timeDate(),
        showPage: false,
        mark: ""
      },
      // 限制到期日期不能选择之前时间
      pickerOptions1: {
        disabledDate(time) {
          return Date.now() > time.getTime();
        }
      },
      vmTd: {
        funcshow: false, //功能弹窗
        funcvalue: [],
        showPay: false, //充值弹窗
        money: 0, //充值金额
        showDate: false, //修改日期弹窗
        selDate: "",
        date: "",
        selDateLst: tools.timeDate()
      },
      vmSku: {
        checkList: [],
        lst: [],
        show: false,
        btnUse: false,
        skuids: []
      }
    };
  },

  methods: {
    skuSel(e) {
      let skuids = [];
      for (let i = 0, len = e.length; i < len; i++) {
        for (let j = 0, len = this.vmSku.lst.length; j < len; j++) {
          if (
            e[i] ===
            this.vmSku.lst[j].name + "/" + this.vmSku.lst[j].stock + "库存"
          ) {
            skuids.push(this.vmSku.lst[j].skuId);
          }
        }
      }
      this.vmSku.skuids = skuids;
    },
    goodPageChange(e) {
      if (e) {
        if (
          this.vm.func.openCart == 1 &&
          this.vm.autoBuyShow &&
          (e.includes("http://") === false && e.includes("https://") === false)
        ) {
          tools.showError("请输入正确的宝贝链接", this);
          return;
        }
        this.loading = true;
        core.tbSku(e, this);
      } else {
        this.vmSku.btnUse = false;
      }
    },
    async sortChange(e) {
      let sort = "";

      if (e.order === "ascending") {
        sort = "ASC";
      } else {
        sort = "Desc";
      }
      this.register_info.sort = sort;
      await core.LoginLst(this.register_info.pageindex, this);
    },
    delAccount(e) {
      core.AccountDel(e.id, this);
    },
    // 修改密码
    changPassword() {
      this.vm.passwordshow = true;
    },
    rePass(isTrue) {
      if (isTrue === false) {
        this.vm.passwordshow = false;
        this.vm.password = "";
        return;
      }
      let tmp = {
        id: tools.sessionGet("aid"),
        password: this.vm.password
      };
      core.UpdatePassword(tmp, this);
    },
    // 显示开通功能弹窗
    funcPop(e) {
      this.vmTd.funcvalue = [];
      if (e.openCart === 1) {
        this.vmTd.funcvalue.push("自动加购收藏宝贝");
      }
      if (e.openCoupon === 1) {
        this.vmTd.funcvalue.push("自动领券");
      }
      if (e.openFollow === 1) {
        this.vmTd.funcvalue.push("关注收藏店铺");
      }
      if (e.openWang === 1) {
        this.vmTd.funcvalue.push("记录旺旺");
      }
      this.vmTd.funcshow = true;
      tools.sessionSet("funcId", e.id);
    },
    //更新开通功能
    updateFunc(isTrue) {
      let vm = this.vmTd;
      let tmp = {
        id: tools.sessionGet("funcId"),
        openFollow: 0,
        openCoupon: 0,
        openCart: 0,
        openWang: 0
      };
      if (isTrue === false) {
        this.vmTd.funcshow = false;
        return;
      }
      if (vm.funcvalue.includes("关注收藏店铺")) {
        tmp.openFollow = 1;
      }
      if (vm.funcvalue.includes("自动加购收藏宝贝")) {
        tmp.openCart = 1;
      }
      if (vm.funcvalue.includes("自动领券")) {
        tmp.openCoupon = 1;
      }
      if (vm.funcvalue.includes("记录旺旺")) {
        tmp.openWang = 1;
      }
      core.UpdateFunc(tmp, this);
    },
    //搜索账号名
    searchAccount(e) {
      if (this.register_info.searchaccount === "") {
        return;
      }
      core.SearchAccount(this.register_info.searchaccount, this);
    },
    async searchAccountClear(e) {
      if (e === "") {
        core.LoginLst(this.register_info.pageindex, this);
      }
    },
    //显示到期日期弹窗
    showDateDig(e) {
      tools.sessionSet("dateId", e.id);
      this.vmTd.showDate = true;
    },
    reDateChange(isTrue) {
      if (isTrue === false) {
        this.vmTd.showDate = false;
        return;
      }
      let exp = "";
      if (this.vmTd.date) {
        exp = this.vmTd.date
          .toLocaleDateString()
          .split("/")
          .join("-");
      } else {
        exp = this.vmTd.selDate;
      }
      let tmp = {
        exp,
        id: tools.sessionGet("dateId")
      };
      core.UpdateTime(tmp, this);
    },
    //检测是否有相同账号
    checkName(e) {
      core.CheckLogin(e, this);
    },
    // 打开充值窗口
    payMoney(e) {
      tools.sessionSet("rechangeId", e.id);
      this.vmTd.showPay = true;
    },
    //充值
    reChage(isTrue) {
      let reg = /^[0-9]+.?[0-9]*$/;
      if (isTrue === false) {
        this.vmTd.showPay = false;
        return;
      }
      if (this.vmTd.money === "") {
        return;
      }
      if (!reg.test(this.vmTd.money)) {
        tools.showError("请输入数字", this);
        return;
      }
      let tmp = {
        id: tools.sessionGet("rechangeId"),
        money: this.vmTd.money
      };
      core.Recharge(tmp, this);
    },
    //退出
    quitOut() {
      this.$router.replace({ name: "login" });
      window.sessionStorage.clear();
    },
    //账号信息分页
    async accountChange(e) {
      document.documentElement.scrollTop = 0;
      await core.LoginLst(e, this);
      this.register_info.pageindex = e;
    },
    // 弹出注册框
    showDig() {
      this.register_info.dialogRegi = true;
    },
    //开通账号
    async registerClick(isTrue) {
      let tmp = this.register_info;
      let reg = /^[0-9]+.?[0-9]*$/;
      if (isTrue == false) {
        this.register_info.dialogRegi = false;
        return;
      }
      if (tmp.showDanger) {
        return;
      }
      if (tmp.account === "") {
        tools.showError("请填写账号名", this);
        return;
      }
      if (tmp.password === "") {
        tools.showError("请填写密码", this);
        return;
      }
      if (tmp.date === "" && tmp.selDate === "") {
        tools.showError("请选择到期日期", this);
        return;
      }
      if (tmp.accountType === "") {
        tools.showError("请选择账号类型", this);
        return;
      }
      if (tmp.tbUserId === "" && tmp.accountType === "user") {
        tools.showError("请输入店铺Id", this);
        return;
      }
      if (tmp.funcvalue.length === 0) {
        tools.showError("请选择功能开通", this);
        return;
      }

      await core.Register(tmp, this);
      core.LoginLst(1, this);
    },
    //账号注册时间选择
    selTime(e) {
      this.register_info.selDate = e;
      this.register_info.date = "";
      this.vmTd.selDate = e;
      this.vmTd.date = "";
    },
    dateChange(e) {
      this.register_info.selDate = "";
      this.register_info.date = e;
      this.vmTd.selDate = "";
      this.vmTd.date = e;
    },
    // tab选择
    async handleClick(tab, event) {
      let tabIndex = Number(tab.index);
      if (tabIndex == 1) {
        core.BuildRecord(1, this);
      }
      if (tabIndex == 2) {
        core.LoginLst(1, this);
      }
      if (tabIndex != 1) {
        this.fifterTmp = "";
        this.vm.selType = "";
        this.vm.pageindex = 1;
        this.searchTmp = "";
        this.vm.searchLink = "";
      }
      if (tabIndex != 2) {
        this.register_info.sort = "";
        this.register_info.pageindex = 1;
        this.register_info.showPage = false;
      }
      if (tabIndex != 0) {
        this.vmSku.checkList = [];
        this.vmSku.lst = [];
        this.vmSku.skuids = [];
        this.vmSku.btnUse = false;
        this.vmSku.show = false;
        this.vm = tools.reset(this.vm);
      }
    },
    //生成记录表列表分页
    async pageindexChange(e) {
      if (this.fifterTmp) {
        this.fifterTmp.pageindex = e;
        core.FifterRecord(this.fifterTmp, this);
        return;
      }
      if (this.searchTmp && this.vm.searchLink) {
        this.searchTmp.pageindex = e;
        core.SearchRecord(this.searchTmp, this);
        return;
      }
      core.BuildRecord(e, this);
      this.vm.pageindex = e;
    },
    // 多项选择
    handleSel(e) {
      if (e.length === 0) {
        this.vm.coupShow = false;
        this.vm.autoBuyShow = false;
        return;
      }
      if (e.includes("自动加购收藏宝贝")) {
        this.vm.autoBuyShow = true;
      } else {
        this.vm.autoBuyShow = false;
        this.vmSku.checkList = [];
        this.vmSku.lst = [];
        this.vmSku.skuids = [];
        this.vmSku.btnUse = false;
        this.vmSku.show = false;
        this.vm.productLink = "";
      }
      if (e.includes("自动领券")) {
        this.vm.coupShow = true;
      } else {
        this.vm.couponPage = "";
        this.vm.coupShow = false;
      }
      this.vm.typeLst = e;
    },
    //生成&&修改
    async createInfo() {
      let isWang = 0, //记录旺旺
        isCoupon = 0, //自动领券
        isCart = 0, //自动加购
        isFollow = 0; //关注收藏店铺
      let vm = this.vm;

      if (vm.typeLst.length === 0) {
        tools.showError("请选择功能", this);
        return;
      }
      if (vm.autoBuyShow && vm.productLink === "") {
        tools.showError("请输入宝贝链接", this);
        return;
      }

      if (this.vmSku.lst.length && this.vmSku.skuids.length == 0) {
        tools.showError("请选择规格", this);
        return;
      }

      if (vm.func.openCoupon == 1 && vm.coupShow && vm.coupon === "") {
        tools.showError("请输入优惠券", this);
        return;
      }
      if (
        vm.func.openCoupon == 1 &&
        vm.coupShow &&
        (vm.coupon.includes(
          "https://taoquan.taobao.com/coupon/unify_apply.htm"
        ) === false &&
          vm.coupon.includes(
            "https://taoquan.taobao.com/coupon/unify_apply.htm"
          ) === false)
      ) {
        tools.showError("请输入正确的优惠券", this);
        return;
      }
      if (vm.jumpLink === "") {
        tools.showError("请输入跳转链接", this);
        return;
      }
      if (
        vm.jumpLink.includes("http://") === false &&
        vm.jumpLink.includes("https://") === false
      ) {
        tools.showError("请输入正确的跳转链接", this);
        return;
      }

      if (vm.typeLst.includes("关注收藏店铺")) {
        isFollow = 1;
      }
      if (vm.typeLst.includes("记录旺旺")) {
        isWang = 1;
      }
      if (vm.typeLst.includes("自动领券")) {
        isCoupon = 1;
      }
      if (vm.typeLst.includes("自动加购收藏宝贝")) {
        isCart = 1;
      }
      let tmp = {
        isWang,
        isCoupon,
        isCart,
        isFollow,
        couponPage: vm.coupon,
        landingPage: vm.jumpLink,
        mark: vm.mark,
        goodPage: vm.autoBuyShow ? vm.productLink : "",
        owner: tools.sessionGet("aid"),
        ownername: tools.sessionGet("account"),
        skuName: this.vmSku.checkList.length
          ? this.vmSku.checkList.join(",")
          : "",
        skuids: this.vmSku.skuids.length ? this.vmSku.skuids.join(",") : 0
      };
      if (vm.editShow) {
        tmp.owner = vm.recordId;
        await core.BuildUpdate(tmp, this);
      } else {
        core.Build(tmp, this);
      }
    },
    //删除生成记录
    async changeItem(e) {
      await core.BuildDel(e.id, this);
      if (Number(this.vm.pageindex) == 0) {
        this.vm.pageindex = 1;
      }
      await core.BuildRecord(this.vm.pageindex, this, true);
    },
    // 修改生成记录
    editItem(e) {
      let type = e.type.split("+");
      this.activeName2 = "first";
      this.vm.typeLst = [];
      if (type.includes("加购")) {
        this.vm.autoBuyShow = true;
        this.vm.productLink = e.goodPage;
        if (e.goodPage) {
          this.loading = true;
          core.tbSku(e.goodPage, this);
        }
        this.vm.typeLst.push("自动加购收藏宝贝");
      }
      if (type.includes("优惠券")) {
        this.vm.coupShow = true;
        this.vm.coupon = e.couponPage;
        this.vm.typeLst.push("自动领券");
      }
      if (type.includes("关注")) {
        this.vm.typeLst.push("关注收藏店铺");
      }
      if (type.includes("旺旺")) {
        this.vm.typeLst.push("记录旺旺");
      }
      this.vm.recordId = e.id;
      this.vm.jumpLink = e.landingPage;
      this.vm.mark = e.mark;
      this.vm.editShow = true;
    },
    //搜索链接
    searchRecord() {
      if (this.vm.searchLink === "") {
        return;
      }
      let tmp = {
        pageindex: 1,
        searchLink: this.vm.searchLink
      };
      this.vm.pageindex = 1;
      this.searchTmp = tmp;
      core.SearchRecord(tmp, this);
    },
    //监听输入搜索变化
    async searchWatch(e) {
      if (e === "") {
        await core.BuildRecord(this.vm.pageindex, this);
      }
    },
    //筛选类型
    fifter(e) {
      this.vm.pageindex = 1;
      if (e === "") {
        return;
      }
      let tmp = {
        isWang: null,
        isCart: null,
        isCoupon: null,
        isFollow: null,
        pageindex: 1
      };
      switch (Number(e)) {
        case 1:
          tmp.isCart = 1;
          break;
        case 2:
          tmp.isFollow = 1;
          break;
        case 3:
          tmp.isWang = 1;
          break;
        case 4:
          tmp.isCoupon = 1;
          break;
      }

      core.FifterRecord(tmp, this);
      this.fifterTmp = tmp;
    },
    async fifterClear() {
      await core.BuildRecord(this.vm.pageindex, this);
    },

    // 查看旺旺列表
    async showWang(e) {
      let tmp = {
        urlsId: e.id,
        pageindex: 1,
        pagesize: 5
      };
      await core.WangLst(tmp, this);
      this.vm.showWang = true;
      this.vm.wangIndex = 1;
      tools.sessionSet("wangwangId", e.id);
    },
    //查看旺旺列表分页
    async wangwangChange(e) {
      let tmp = {
        urlsId: tools.sessionGet("wangwangId"),
        pageindex: e,
        pagesize: 5
      };
      this.vm.wangIndex = e;
      await core.WangLst(tmp, this);
    }
  },
  mounted() {
    tools.fontSize();
    this.register_info.selDateLst = tools.timeDate();
  }
};
</script>


