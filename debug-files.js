#!/usr/bin/env node

const { glob } = require('glob');
const fs = require('fs-extra');
const path = require('path');

async function debugFiles() {
  console.log('🔍 调试文件查找...');
  console.log('当前工作目录:', process.cwd());
  
  // 检查根目录文件
  console.log('\n📁 检查根目录文件:');
  try {
    const rootFiles = await fs.readdir('.');
    const glbFiles = rootFiles.filter(file => file.toLowerCase().endsWith('.glb'));
    console.log('根目录 GLB 文件:', glbFiles);
  } catch (error) {
    console.error('读取根目录失败:', error.message);
  }
  
  // 检查 models 目录
  console.log('\n📁 检查 models 目录:');
  try {
    if (await fs.pathExists('models')) {
      const modelFiles = await fs.readdir('models');
      const glbFiles = modelFiles.filter(file => file.toLowerCase().endsWith('.glb'));
      console.log('models 目录 GLB 文件:', glbFiles);
    } else {
      console.log('models 目录不存在');
    }
  } catch (error) {
    console.error('读取 models 目录失败:', error.message);
  }
  
  // 测试 glob 模式
  console.log('\n🔍 测试 glob 模式:');
  const patterns = [
    '*.glb',
    '**/*.glb',
    './*.glb',
    './**/*.glb'
  ];
  
  for (const pattern of patterns) {
    try {
      const files = await glob(pattern, { 
        ignore: ['**/node_modules/**', '**/compressed/**'],
        absolute: true 
      });
      console.log(`模式 "${pattern}":`, files.length, '个文件');
      if (files.length > 0) {
        files.forEach(file => {
          const relativePath = path.relative('.', file);
          console.log(`  - ${relativePath}`);
        });
      }
    } catch (error) {
      console.error(`模式 "${pattern}" 失败:`, error.message);
    }
  }
  
  // 测试绝对路径
  console.log('\n🔍 测试绝对路径:');
  const absolutePatterns = [
    path.join(process.cwd(), '*.glb'),
    path.join(process.cwd(), '**/*.glb')
  ];
  
  for (const pattern of absolutePatterns) {
    try {
      const files = await glob(pattern, { 
        ignore: ['**/node_modules/**', '**/compressed/**'],
        absolute: true 
      });
      console.log(`绝对路径模式 "${pattern}":`, files.length, '个文件');
      if (files.length > 0) {
        files.forEach(file => {
          const relativePath = path.relative(process.cwd(), file);
          console.log(`  - ${relativePath}`);
        });
      }
    } catch (error) {
      console.error(`绝对路径模式 "${pattern}" 失败:`, error.message);
    }
  }
}

debugFiles().catch(console.error); 