<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="~assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="_logout">退出</el-button>
    </el-header>
    <!-- 主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="_togleCollapse">|||</div>
        <!-- :unique-opened="true"->只允许展开一个菜单 -->
        <!-- :collapse-transition="false" -> 关闭动画 -->
        <!-- router -> 导航开启路由模式 -->
        <!-- :default-active="$router.path" -->

        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409FFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单  -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="_saveNavState('/' + subItem.path)"
            >
              <!-- 导航开启路由模式：
              将index值作为导航路由-->
              <!-- 二级菜单的模板区域 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      iconList: {
        '125': 'iconfont icon-yonghuguanli',
        '103': 'iconfont icon-quanxian',
        '101': 'iconfont icon-xiazai',
        '102': 'iconfont icon-dingdan',
        '145': 'iconfont icon-tongji'
      },
      // 默认不折叠
      isCollapse: false,
      // 被激活导航地址
      activePath: ''
    }
  },
  created() {
    this._getMenuList()
    // 获取连接的激活地址
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    _logout() {
      // 清空token
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取请求菜单
    _getMenuList() {
      const { data: res } = this.$http.get('menus').then(res => {
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menuList = res.data
      })
    },
    // 菜单的折叠与展开
    _togleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存连接的激活地址
    _saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373f41;
  display: flex;
  justify-content: space-between;
  // padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    width: 100%;
    display: flex;
    align-items: center;
    img {
      height: 40px;
      border-radius: 50%;
      background-color: #eee;
    }
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;

  .el-menu {
    //边框对齐
    border: none;
  }
}
.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  // 鼠标放上去变成小手
  cursor: pointer;
}
</style>