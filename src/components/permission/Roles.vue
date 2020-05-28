<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>

      <!-- 用户列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="item1 in scope.row.children" :key="item1.id" class="elrow">
              <!-- 一级权限 -->
              <el-col :span="3">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级 -->
              <el-col :span="21">
                <el-row
                  v-for="(item2,index) in item1.children"
                  :key="item2.id"
                  :class="[index === item1.children.length-1 ? '' : 'elrow' ]"
                >
                  <!-- 二级 -->
                  <el-col :span="5">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                    >{{ item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="19">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{ item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <el-form :model="addRoleForm" label-width="100px" :rules="roleFormRules" ref="addRoleFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑角色的对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed"
    >
      <el-form
        :model="editRoleForm"
        label-width="100px"
        :rules="roleFormRules"
        ref="editRoleFormRef"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        ref="treeRef"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表
      rolesList: [],
      // 添加角色表单
      addRoleForm: {},
      //   添加用户对话框
      addRoleDialogVisible: false,

      // 编辑角色信息
      editRoleForm: {},
      editRoleDialogVisible: false,
      roleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },

      // 分配权限框
      setRightDialogVisible: false,
      // 权限列表
      rightsList: [],
      //  树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //   默认选中节点ID值
      defKeys: [],
      //   当前即将分配权限的角色Id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    getRolesList() {
      this.$http.get('roles').then(res => {
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.rolesList = res.data
      })
    },
    // 添加角色
    addRoles() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        this.$http.post('roles', this.addRoleForm).then(res => {
          if (res.meta.status !== 201) {
            this.$message.error('添加角色失败！')
          }
          this.$message.success('添加角色成功！')
          this.addRoleDialogVisible = false
          this.getRolesList()
        })
      })
    },
    // 添加角色对话框的关闭
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 删除角色
    removeRoleById(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http.delete('roles/' + id).then(res => {
            if (res.meta.status !== 200)
              return this.$message.error('删除角色失败！')
            this.$message.success('删除用户成功！')
            this.getRolesList()
          })
        })
        .catch(err => {
          this.$message.info('已取消删除')
        })
    },
    // 编辑角色
    showEditDialog(id) {
      this.$http.get('roles/' + id).then(res => {
        if (res.meta.status !== 200)
          return this.$message.error('查询角色信息失败！')
        this.editRoleForm = res.data
        this.editRoleDialogVisible = true
      })
    },
    // 编辑角色
    editRoles() {
      this.$refs.editRoleFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        this.$http
          .put('roles/' + this.editRoleForm.roleId, {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          })
          .then(res => {
            if (res.meta.status !== 200) {
              this.$message.error('更新角色信息失败！')
            }
            // 隐藏编辑角色对话框
            this.editRoleDialogVisible = false
            this.$message.success('更新角色信息成功！')
            this.getRolesList()
          })
      })
    },
    // 添加角色对话框的关闭
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 根据ID删除对应的权限
    removeRightById(role, rightId) {
      // 弹框提示 删除
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(res => {
            if (res.meta.status !== 200) {
              return this.$message.error('删除权限失败！')
            }
            this.$message.success('删除权限成功！')
            role.children = res.data
          })
        })
        .catch(err => {
          this.$message.info('已取消权限删除')
        })
    },
    // 分配权限
    showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限
      this.$http.get('rights/tree').then(res => {
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限数据失败！')
        }
        //   获取权限树
        this.rightsList = res.data
        //   console.log(res)
        //   递归获取已有权限的id
        this.getLeafkeys(role, this.defKeys)
        this.setRightDialogVisible = true
      })
    },
    // 通过递归 获取角色下已有的三级权限的 id, 并保存到defKeys数组
    getLeafkeys(node, arr) {
      // 没有children属性，则是三级节点。递归终止
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafkeys(item, arr))
    },
    // 权限对话框关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 分配权限
    allotRights(roleId) {
      // 获得当前选中和半选中的Id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // join() 方法用于把数组中的所有元素放入一个字符串
      const idStr = keys.join(',')
      this.$http
        .post(`roles/${this.roleId}/rights`, { rids: idStr })
        .then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error('分配权限失败！')
          }
          this.$message.success('分配权限成功!')
          this.getRolesList()
          this.setRightDialogVisible = false
        })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.elrow {
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}
</style>