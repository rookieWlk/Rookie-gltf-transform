# GLB 文件批量压缩工具

一个基于 `@gltf-transform/cli` 的一键压缩所有 GLB 模型文件的 Node.js 脚本。

## 功能特性

- 🚀 **批量处理**: 自动查找并压缩目录下所有 `.glb` 文件
- 📊 **压缩统计**: 显示详细的压缩结果和文件大小对比
- ⚙️ **灵活配置**: 支持多种压缩质量和参数设置
- 🔍 **错误处理** - 完善的错误处理和用户友好的错误信息
- 🎨 **彩色输出**: 使用彩色控制台输出，信息清晰易读
- 📁 **目录保持**: 保持原始目录结构输出到压缩目录


## 主要功能

### 完整版脚本 (`compress-glb.js`)
- ✅ 支持命令行参数配置
- ✅ 多种压缩质量预设 (low/medium/high)
- ✅ 可选择性启用/禁用压缩选项
- ✅ 详细的压缩统计和进度显示
- ✅ 彩色控制台输出

### 简化版脚本 (`simple-compress.js`)
- ✅ 一键运行，无需参数
- ✅ 自动查找所有 GLB 文件
- ✅ 显示压缩前后文件大小对比
- ✅ 简洁的输出信息


## 安装

1. 克隆或下载项目文件
2. 安装依赖：

```bash
npm install
```

## 使用方法

### 快速开始
```bash
# 安装依赖
npm install

# 简单模式（推荐）
npm run compress:simple

# 完整模式
npm run compress
```

### 高级用法

```bash
# 高质量压缩
node compress-glb.js -q high

# 指定目录
node compress-glb.js -i ./models -o ./my-compressed
```

### 命令行参数

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--input` | `-i` | 输入目录 | `.` |
| `--output` | `-o` | 输出目录 | `./compressed` |
| `--pattern` | `-p` | 文件匹配模式 | `**/*.glb` |
| `--quality` | `-q` | 压缩质量 (low/medium/high) | `medium` |
| `--no-draco` | - | 禁用 Draco 压缩 | - |
| `--no-texture` | - | 禁用纹理压缩 | - |
| `--no-mesh` | - | 禁用网格优化 | - |
| `--max-texture-size` | - | 最大纹理尺寸 | `1024` |
| `--watch` | `-w` | 监听模式 | - |

### 压缩质量预设

| 质量 | Draco 压缩级别 | 纹理最大尺寸 | 网格简化 |
|------|----------------|--------------|----------|
| `low` | 7 (最高压缩) | 512px | 0.5 |
| `medium` | 5 (平衡) | 1024px | 0.8 |
| `high` | 3 (高质量) | 2048px | 0.9 |

## 输出示例

```
🚀 开始批量压缩 GLB 文件...
输入目录: .
输出目录: ./compressed
压缩质量: medium

找到 3 个 GLB 文件

正在压缩: models/character.glb
✓ 压缩完成: models/character.glb
  原始大小: 15.2 MB
  压缩后: 8.7 MB
  压缩率: 42.8%

正在压缩: models/scene.glb
✓ 压缩完成: models/scene.glb
  原始大小: 45.6 MB
  压缩后: 23.1 MB
  压缩率: 49.3%

📊 压缩统计:
总文件数: 3
成功: 2
失败: 0
跳过: 0

✅ 压缩完成！
```

## 文件结构

```
project/
├── package.json          # 项目配置和依赖
├── compress-glb.js       # 主脚本文件
├── README.md            # 说明文档
├── models/              # 原始模型文件
│   ├── character.glb
│   └── scene.glb
└── compressed/          # 压缩后的文件
    ├── character.glb
    └── scene.glb
```

## 依赖项

- `@gltf-transform/cli`: GLB/GLTF 转换和优化工具
- `@gltf-transform/core`: 核心转换功能
- `@gltf-transform/extensions`: 扩展功能支持
- `fs-extra`: 文件系统操作增强
- `glob`: 文件模式匹配
- `chalk`: 控制台彩色输出
- `commander`: 命令行参数解析

## 注意事项

1. **备份原始文件**: 建议在压缩前备份原始 GLB 文件
2. **压缩质量**: 高质量压缩会保留更多细节但文件更大
3. **纹理格式**: 默认使用 WebP 格式压缩纹理，确保兼容性
4. **内存使用**: 处理大文件时可能需要较多内存

## 故障排除

### 常见问题

1. **找不到 GLB 文件**
   - 检查文件路径和匹配模式
   - 确保文件扩展名为 `.glb`

2. **压缩失败**
   - 检查文件是否损坏
   - 确保有足够的磁盘空间
   - 查看错误信息进行调试

3. **权限问题**
   - 确保对输入和输出目录有读写权限

### 调试模式

可以修改脚本添加更多调试信息：

```javascript
// 在 buildCommand 方法中添加
console.log('执行命令:', command);
```

## 许可证

MIT License 