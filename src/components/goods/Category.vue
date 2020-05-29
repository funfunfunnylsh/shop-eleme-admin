<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>

      <!-- 表格 -->
      <el-table
        :data="cateList"
        border
        stripe
        row-key="cat_id"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <!-- stripe: 斑马条纹
        border：边框-->
        <el-table-column type="index" label="#">
          <template slot-scope="scope">
            <span>{{getTreeIndex(scope.row.cat_id)}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column prop="cat_deleted" label="是否有效">
          <!-- 是否有效 -->
          <template slot-scope="scope">
            <i
              class="el-icon-success"
              style="color: lightgreen"
              v-if="scope.row.cat_deleted === false"
            ></i>
          </template>
        </el-table-column>
        <el-table-column prop="cat_level" label="排序">
          <!-- 排序 -->
          <template slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditCateDialog(scope.row.cat_id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeCate(scope.row.cat_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 编辑分类的对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%">
      <el-form
        :model="editCateForm"
        :rules="cateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="eidtCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form :model="addCateForm" :rules="cateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options：数据源 -->
          <!-- props：指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            filterable
            style="width: 100%"
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,

      // 编辑对话框 控制
      editCateDialogVisible: false,
      // 编辑表单 绑定对象
      editCateForm: '',
      // 分类表单验证
      cateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },

      // 添加分类
      addCateDialogVisible: false,
      // 添加分类对象
      addCateForm: {
        // 将要添加分类名称
        cat_name: '',
        // 分类父级id
        cat_pid: 0,
        // 分类等级：`0`表示一级分类；`1`表示二级分类；`2`表示三级分类
        cat_level: 0
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 配置触发选项 hover/click
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级Id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    getCateList() {
      this.$http
        .get('categories', {
          params: this.queryInfo
        })
        .then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error('获取商品分类失败！')
          }
          // 给数据列表赋值
          this.cateList = res.data.result
          // 总数据条数
          this.total = res.data.total
          console.log(res)
        })
    },
    // 获取index
    getTreeIndex(catId) {
      // for (let i = 0; i < this.cateList.length; i++) {
      //   if (this.cateList[i].cat_id === catId) {
      //     return i + 1
      //   }
      // }
      // 找到对应的索引值
      let i = this.cateList.findIndex(item => item.cat_id === catId)
      return i + 1 === 0 ? '' : i + 1
    },
    // 监听 pageSizeChange
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 显示编辑对话框
    showEditCateDialog(id) {
      this.$http.get('categories/' + id).then(res => {
        if (res.meta.status !== 200)
          return this.$message.error('获取分类失败！')
        this.editCateForm = res.data
        this.editCateDialogVisible = true
      })
    },
    // 编辑分类名
    eidtCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        this.$http
          .put('categories/' + this.editCateForm.cat_id, {
            cat_name: this.editCateForm.cat_name
          })
          .then(res => {
            if (res.meta.status !== 200)
              return this.$message.error('更新分类名失败！')
            this.$message.success('更新分类名成功！')
            this.getCateList()
            this.editCateDialogVisible = false
          })
      })
    },
    // 删除分类
    removeCate(id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          this.$http.delete('categories/' + id).then(res => {
            if (res.meta.status !== 200) {
              return this.$message.error('删除商品分类失败！')
            }
            this.$message.success('删除商品分类成功！')
            this.getCateList()
          })
        })
        .catch(err => {
          this.$message.info('已取消删除！')
        })
    },

    // 添加操作
    showAddCateDialog() {
      // 先获取父级分类数据
      this.$http
        .get('categories', {
          params: { type: 2 }
        })
        .then(res => {
          if (res.meta.status !== 200) {
            return this.$message.error('获取父级分类失败！')
          }
          this.parentCateList = res.data
        })
      // 再打开对话框
      this.addCateDialogVisible = true
    },
    // 添加分类 选择项发生变化触发
    parentCateChanged() {
      // 如何selectKeys 数组的长度>0 说明选中父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 当前分类的等级
        this.addCateForm.cat_level = this.selectedKeys.length
        return 0
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 当前分类的等级
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        this.$http.post('categories', this.addCateForm).then(res => {
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败！')
          }

          this.$message.success('添加分类成功！')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      })
    },
    // 添加分类 重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style>
</style>