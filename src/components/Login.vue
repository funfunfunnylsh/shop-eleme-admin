<template>
  <div class="login-container">
    <div class="login-box">
      <div class="avator-box">
        <img src="~assets/logo.png" />
      </div>
      <el-form ref="loginFormRef" class="login-form" :model="loginForm" :rules="rules">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            class="login-input"
            prefix-icon="iconfont icon-zhanghao"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            class="login-input"
            prefix-icon="iconfont icon-zhanghaomima"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(valid => {
        if (valid) {
          this.$http.post('login', this.loginForm).then(res => {
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error('登录失败')
            this.$message.success('登录成功')
            // 1、将登陆成功之后的token, 保存到客户端的sessionStorage中; localStorage中是持久化的保存
            //   1.1 项目中出现了登录之外的其他API接口，必须在登陆之后才能访问
            //   1.2 token 只应在当前网站打开期间生效，所以将token保存在sessionStorage中
            window.sessionStorage.setItem('token', res.data.token)
            // 2、通过编程式导航跳转到后台主页
            this.$router.push('/home')
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm() {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  width: 100%;
  height: 100%;
  background-color: #2d3a4b;
}

.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 5px;
}

.avator-box {
  width: 130px;
  height: 130px;
  padding: 10px;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border: 1px solid #eee;
  box-shadow: 0 0 10px #ddd;

  img {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background-color: #eee;
  }
}

.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.login-input {
  margin: 0;
  width: 100%;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
