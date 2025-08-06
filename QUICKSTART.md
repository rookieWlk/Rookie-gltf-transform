# 快速开始指南

## 🚀 5分钟快速上手

### 1. 安装依赖

```bash
npm install
```

### 2. 准备 GLB 文件

将你的 `.glb` 文件放在项目目录中，例如：

```
project/
├── models/
│   ├── character.glb
│   ├── scene.glb
│   └── vehicle.glb
└── ...
```

### 3. 运行压缩

#### 方式一：简单模式（推荐新手）
```bash
npm run compress:simple
```

#### 方式二：完整模式（更多选项）
```bash
npm run compress
```

### 4. 查看结果

压缩后的文件会保存在 `compressed` 目录中：

```
project/
├── models/
│   ├── character.glb
│   ├── scene.glb
│   └── vehicle.glb
├── compressed/
│   ├── character.glb  ← 压缩后的文件
│   ├── scene.glb      ← 压缩后的文件
│   └── vehicle.glb    ← 压缩后的文件
└── ...
```

## 📊 预期输出

```
🚀 开始批量压缩 GLB 文件...

📁 输出目录: ./compressed

🔍 找到 3 个 GLB 文件

开始压缩...

🔄 正在压缩: models/character.glb
✅ 压缩完成: models/character.glb
   📏 原始: 15.2 MB → 压缩后: 8.7 MB (节省 42.8%)

🔄 正在压缩: models/scene.glb
✅ 压缩完成: models/scene.glb
   📏 原始: 45.6 MB → 压缩后: 23.1 MB (节省 49.3%)

📊 压缩统计:
   总文件数: 3
   ✅ 成功: 2
   ❌ 失败: 0

🎉 压缩完成！文件已保存到 compressed 目录
```

## ⚡ 常用命令

```bash
# 基本压缩
npm run compress:simple

# 指定目录压缩
node compress-glb.js -i ./my-models -o ./my-compressed

# 高质量压缩
node compress-glb.js -q high

# 快速压缩（低质量）
node compress-glb.js -q low
```

## 🔧 故障排除

### 问题：找不到 GLB 文件
**解决：** 确保文件扩展名是 `.glb`（小写）

### 问题：压缩失败
**解决：** 
1. 检查文件是否损坏
2. 确保有足够磁盘空间
3. 检查文件权限

### 问题：命令不存在
**解决：** 运行 `npm install` 安装依赖

## 💡 小贴士

1. **备份原始文件** - 压缩前建议备份
2. **测试压缩效果** - 先用一个文件测试
3. **选择合适的质量** - 根据需求选择 low/medium/high
4. **检查文件大小** - 压缩后检查文件是否变小

## 🆘 需要帮助？

如果遇到问题，请检查：
- Node.js 版本是否 >= 14
- 是否有足够的磁盘空间
- 文件路径是否包含特殊字符 