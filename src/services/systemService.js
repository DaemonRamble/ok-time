const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');
const TimeService = require('./timeService');

class SystemService {
  /**
   * 获取系统状态信息
   * @returns {Promise<Object>} 系统状态对象
   */
  static async getSystemStatus() {
    const uptime = process.uptime();
    
    return {
      uptime: TimeService.formatUptime(uptime),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        system: Math.round(os.totalmem() / 1024 / 1024 * 100) / 100
      },
      cpu: {
        arch: os.arch(),
        platform: os.platform(),
        cores: os.cpus().length
      },
      node: process.version,
      pid: process.pid
    };
  }

  /**
   * 获取SSH信息（过滤敏感数据）
   * @returns {Promise<Object>} SSH状态信息
   */
  static async getSSHInfo() {
    return new Promise((resolve) => {
      // 检查SSH服务状态
      if (fs.existsSync('/tmp/.sshinfo')) {
        fs.readFile('/tmp/.sshinfo', 'utf8', (err, data) => {
          if (err) {
            resolve({ status: 'unavailable', message: 'SSH服务未配置' });
            return;
          }
          
          // 过滤敏感信息，只返回状态
          if (data.includes('ssh')) {
            resolve({ 
              status: 'available', 
              message: 'SSH服务已启动',
              timestamp: new Date().toISOString()
            });
          } else {
            resolve({ status: 'unavailable', message: 'SSH服务未就绪' });
          }
        });
      } else {
        resolve({ status: 'unavailable', message: 'SSH服务未配置' });
      }
    });
  }

  /**
   * 执行系统命令（受限）
   * @param {string} command - 命令
   * @returns {Promise<Object>} 执行结果
   */
  static async executeCommand(command) {
    // 安全的命令白名单
    const allowedCommands = ['date', 'uptime', 'whoami', 'pwd'];
    const baseCommand = command.split(' ')[0];
    
    if (!allowedCommands.includes(baseCommand)) {
      return {
        success: false,
        error: '命令不被允许执行'
      };
    }

    return new Promise((resolve) => {
      exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            success: false,
            error: error.message
          });
        } else {
          resolve({
            success: true,
            output: stdout.trim(),
            stderr: stderr.trim()
          });
        }
      });
    });
  }
}

module.exports = SystemService;

// 此文件是一个模块
