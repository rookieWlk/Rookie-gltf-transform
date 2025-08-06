#!/usr/bin/env node

const { glob } = require('glob');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 简单的 GLB 文件批量压缩工具
 */
class SimpleGLBCompressor {
  constructor() {
    this.inputDir = '.';
    this.outputDir = './compressed';
    this.stats = {
      total: 0,
      success: 0,
      failed: 0
    };
  }

  /**
   * 查找所有 GLB 文件
   */
  async findGLBFiles() {
    try {
      // 查找根目录和子目录中的所有 GLB 文件
      const patterns = [
        path.join(this.inputDir, '*.glb'),           // 根目录的 GLB 文件
        path.join(this.inputDir, '**/*.glb')         // 子目录的 GLB 文件
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
          console.log(`⚠️  模式 "${pattern}" 查找失败:`, error.message);
        }
      }
      
      // 去重
      allFiles = [...new Set(allFiles)];
      
      console.log(`🔍 找到 ${allFiles.length} 个 GLB 文件`);
      if (allFiles.length > 0) {
        console.log('📁 文件列表:');
        allFiles.forEach(file => {
          const relativePath = path.relative(this.inputDir, file);
          console.log(`   - ${relativePath}`);
        });
      } else {
        // 如果没有找到文件，尝试直接检查 models 目录
        console.log('🔍 尝试直接检查 models 目录...');
        const modelsPath = path.join(this.inputDir, 'models');
        if (await fs.pathExists(modelsPath)) {
          const modelFiles = await fs.readdir(modelsPath);
          const glbFiles = modelFiles.filter(file => file.toLowerCase().endsWith('.glb'));
          if (glbFiles.length > 0) {
            console.log('📁 在 models 目录中找到 GLB 文件:');
            glbFiles.forEach(file => {
              const fullPath = path.join(modelsPath, file);
              allFiles.push(fullPath);
              console.log(`   - models/${file}`);
            });
          }
        }
      }
      
      return allFiles;
    } catch (error) {
      console.error('❌ 查找文件时出错:', error.message);
      return [];
    }
  }

  /**
   * 压缩单个文件
   */
  async compressFile(inputFile) {
    const relativePath = path.relative(this.inputDir, inputFile);
    const outputFile = path.join(this.outputDir, relativePath);
    
    // 确保输出目录存在
    await fs.ensureDir(path.dirname(outputFile));
    
    try {
      // 构建压缩命令
      const command = `npx gltf-transform optimize "${inputFile}" "${outputFile}" --compress draco --texture-compress webp --texture-size 1024 --no-join`;
      
      console.log(`🔄 正在压缩: ${relativePath}`);
      
      // 执行压缩
      execSync(command, { stdio: 'pipe' });
      
      // 获取文件大小信息
      const inputStats = await fs.stat(inputFile);
      const outputStats = await fs.stat(outputFile);
      const compressionRatio = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
      
      console.log(`✅ 压缩完成: ${relativePath}`);
      console.log(`   📏 原始: ${this.formatFileSize(inputStats.size)} → 压缩后: ${this.formatFileSize(outputStats.size)} (节省 ${compressionRatio}%)`);
      
      this.stats.success++;
      return true;
      
    } catch (error) {
      console.error(`❌ 压缩失败: ${relativePath}`);
      console.error(`   错误: ${error.message}`);
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
    console.log('🚀 开始批量压缩 GLB 文件...\n');
    
    // 确保输出目录存在
    await fs.ensureDir(this.outputDir);
    console.log(`📁 输出目录: ${this.outputDir}\n`);
    
    // 查找所有 GLB 文件
    const files = await this.findGLBFiles();
    this.stats.total = files.length;
    
    if (files.length === 0) {
      console.log('⚠️  没有找到 GLB 文件');
      return;
    }
    
    console.log('开始压缩...\n');
    
    // 批量处理文件
    for (const file of files) {
      await this.compressFile(file);
      console.log(''); // 空行分隔
    }
    
    // 显示统计信息
    this.showStats();
  }

  /**
   * 显示统计信息
   */
  showStats() {
    console.log('📊 压缩统计:');
    console.log(`   总文件数: ${this.stats.total}`);
    console.log(`   ✅ 成功: ${this.stats.success}`);
    console.log(`   ❌ 失败: ${this.stats.failed}`);
    
    if (this.stats.success > 0) {
      console.log('\n🎉 压缩完成！文件已保存到 compressed 目录');
    } else {
      console.log('\n💥 没有文件成功压缩');
    }
  }
}

// 主函数
async function main() {
  try {
    const compressor = new SimpleGLBCompressor();
    await compressor.compressAll();
  } catch (error) {
    console.error('💥 程序执行出错:', error.message);
    process.exit(1);
  }
}

// 运行程序
main(); 