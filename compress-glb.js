#!/usr/bin/env node

const { program } = require('commander');
const { glob } = require('glob');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// 配置选项
const DEFAULT_OPTIONS = {
  inputDir: '.',
  outputDir: './compressed',
  pattern: '**/*.glb',
  quality: 'medium',
  draco: true,
  textureCompression: true,
  meshOptimization: true,
  textureResize: true,
  maxTextureSize: 1024,
  watch: false
};

// 压缩质量预设
const QUALITY_PRESETS = {
  low: {
    draco: '--draco.compressionLevel=7',
    texture: '--texture.maxSize=512',
    mesh: '--meshopt.simplify=0.5'
  },
  medium: {
    draco: '--draco.compressionLevel=5',
    texture: '--texture.maxSize=1024',
    mesh: '--meshopt.simplify=0.8'
  },
  high: {
    draco: '--draco.compressionLevel=3',
    texture: '--texture.maxSize=2048',
    mesh: '--meshopt.simplify=0.9'
  }
};

class GLBCompressor {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.stats = {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0
    };
  }

  /**
   * 查找所有 GLB 文件
   */
  async findGLBFiles() {
    try {
      // 查找根目录和子目录中的所有 GLB 文件
      const patterns = [
        path.join(this.options.inputDir, '*.glb'),           // 根目录的 GLB 文件
        path.join(this.options.inputDir, '**/*.glb')         // 子目录的 GLB 文件
      ];
      
      let allFiles = [];
      for (const pattern of patterns) {
        try {
          const files = await glob(pattern, { 
            ignore: ['**/node_modules/**', '**/compressed/**'],
            absolute: true,
            windowsPathsNoEscape: true  // Windows 路径处理
          });
          allFiles = allFiles.concat(files);
        } catch (error) {
          console.log(chalk.yellow(`⚠️  模式 "${pattern}" 查找失败:`, error.message));
        }
      }
      
      // 去重
      allFiles = [...new Set(allFiles)];
      
      console.log(chalk.blue(`找到 ${allFiles.length} 个 GLB 文件`));
      if (allFiles.length > 0) {
        console.log(chalk.gray('📁 文件列表:'));
        allFiles.forEach(file => {
          const relativePath = path.relative(this.options.inputDir, file);
          console.log(chalk.gray(`   - ${relativePath}`));
        });
      } else {
        // 如果没有找到文件，尝试直接检查 models 目录
        console.log(chalk.yellow('🔍 尝试直接检查 models 目录...'));
        const modelsPath = path.join(this.options.inputDir, 'models');
        if (await fs.pathExists(modelsPath)) {
          const modelFiles = await fs.readdir(modelsPath);
          const glbFiles = modelFiles.filter(file => file.toLowerCase().endsWith('.glb'));
          if (glbFiles.length > 0) {
            console.log(chalk.green('📁 在 models 目录中找到 GLB 文件:'));
            glbFiles.forEach(file => {
              const fullPath = path.join(modelsPath, file);
              allFiles.push(fullPath);
              console.log(chalk.gray(`   - models/${file}`));
            });
          }
        }
      }
      
      return allFiles;
    } catch (error) {
      console.error(chalk.red('查找文件时出错:'), error.message);
      return [];
    }
  }

  /**
   * 确保输出目录存在
   */
  async ensureOutputDir() {
    try {
      await fs.ensureDir(this.options.outputDir);
      console.log(chalk.green(`输出目录已创建: ${this.options.outputDir}`));
    } catch (error) {
      console.error(chalk.red('创建输出目录失败:'), error.message);
      throw error;
    }
  }

  /**
   * 构建 gltf-transform 命令
   */
  buildCommand(inputFile, outputFile) {
    const preset = QUALITY_PRESETS[this.options.quality];
    const baseCommand = 'npx gltf-transform optimize';
    
    let command = `${baseCommand} "${inputFile}" "${outputFile}"`;
    
    // 添加 Draco 压缩
    if (this.options.draco) {
      command += ` --compress draco`;
    }
    
    // 添加纹理压缩
    if (this.options.textureCompression) {
      command += ` --texture-compress webp`;
    }
    
    // 添加纹理尺寸限制
    if (this.options.textureResize) {
      command += ` --texture-size ${this.options.maxTextureSize}`;
    }
    
    // 添加网格简化
    if (this.options.meshOptimization) {
      command += ` --simplify`;
    }
    
    // 禁用 join 操作以避免某些文件的兼容性问题
    command += ` --no-join`;
    
    return command;
  }

  /**
   * 压缩单个 GLB 文件
   */
  async compressFile(inputFile) {
    const relativePath = path.relative(this.options.inputDir, inputFile);
    const outputFile = path.join(this.options.outputDir, relativePath);
    
    // 确保输出文件的目录存在
    await fs.ensureDir(path.dirname(outputFile));
    
    try {
      const command = this.buildCommand(inputFile, outputFile);
      
      console.log(chalk.yellow(`正在压缩: ${relativePath}`));
      
      // 执行压缩命令
      execSync(command, { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // 获取文件大小信息
      const inputStats = await fs.stat(inputFile);
      const outputStats = await fs.stat(outputFile);
      const compressionRatio = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
      
      console.log(chalk.green(`✓ 压缩完成: ${relativePath}`));
      console.log(chalk.gray(`  原始大小: ${this.formatFileSize(inputStats.size)}`));
      console.log(chalk.gray(`  压缩后: ${this.formatFileSize(outputStats.size)}`));
      console.log(chalk.gray(`  压缩率: ${compressionRatio}%`));
      
      this.stats.success++;
      return true;
      
    } catch (error) {
      console.error(chalk.red(`✗ 压缩失败: ${relativePath}`));
      console.error(chalk.red(`  错误: ${error.message}`));
      this.stats.failed++;
      return false;
    }
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * 批量压缩所有文件
   */
  async compressAll() {
    console.log(chalk.cyan('🚀 开始批量压缩 GLB 文件...'));
    console.log(chalk.gray(`输入目录: ${this.options.inputDir}`));
    console.log(chalk.gray(`输出目录: ${this.options.outputDir}`));
    console.log(chalk.gray(`压缩质量: ${this.options.quality}`));
    console.log('');
    
    // 确保输出目录存在
    await this.ensureOutputDir();
    
    // 查找所有 GLB 文件
    const files = await this.findGLBFiles();
    this.stats.total = files.length;
    
    if (files.length === 0) {
      console.log(chalk.yellow('没有找到 GLB 文件'));
      return;
    }
    
    // 批量处理文件
    for (const file of files) {
      this.stats.processed++;
      await this.compressFile(file);
      console.log(''); // 添加空行分隔
    }
    
    // 显示统计信息
    this.showStats();
  }

  /**
   * 显示压缩统计信息
   */
  showStats() {
    console.log(chalk.cyan('📊 压缩统计:'));
    console.log(chalk.gray(`总文件数: ${this.stats.total}`));
    console.log(chalk.green(`成功: ${this.stats.success}`));
    console.log(chalk.red(`失败: ${this.stats.failed}`));
    console.log(chalk.yellow(`跳过: ${this.stats.skipped}`));
    
    if (this.stats.success > 0) {
      console.log(chalk.green('✅ 压缩完成！'));
    } else {
      console.log(chalk.red('❌ 没有文件成功压缩'));
    }
  }

  /**
   * 监听模式
   */
  async watch() {
    console.log(chalk.cyan('👀 监听模式已启动，等待文件变化...'));
    
    // 这里可以添加文件监听逻辑
    // 由于实现复杂，这里只是示例
    console.log(chalk.yellow('监听模式功能待实现'));
  }
}

// 命令行参数解析
program
  .name('glb-compressor')
  .description('一键压缩所有 GLB 文件的工具')
  .version('1.0.0')
  .option('-i, --input <dir>', '输入目录', '.')
  .option('-o, --output <dir>', '输出目录', './compressed')
  .option('-p, --pattern <pattern>', '文件匹配模式', '**/*.glb')
  .option('-q, --quality <level>', '压缩质量 (low/medium/high)', 'medium')
  .option('--no-draco', '禁用 Draco 压缩')
  .option('--no-texture', '禁用纹理压缩')
  .option('--no-mesh', '禁用网格优化')
  .option('--max-texture-size <size>', '最大纹理尺寸', '1024')
  .option('-w, --watch', '监听模式')
  .parse();

const options = program.opts();

// 创建压缩器实例
const compressor = new GLBCompressor({
  inputDir: options.input,
  outputDir: options.output,
  pattern: options.pattern,
  quality: options.quality,
  draco: options.draco,
  textureCompression: options.texture,
  meshOptimization: options.mesh,
  maxTextureSize: parseInt(options.maxTextureSize),
  watch: options.watch
});

// 执行压缩
async function main() {
  try {
    if (options.watch) {
      await compressor.watch();
    } else {
      await compressor.compressAll();
    }
  } catch (error) {
    console.error(chalk.red('程序执行出错:'), error.message);
    process.exit(1);
  }
}

main(); 