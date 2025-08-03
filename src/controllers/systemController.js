const SystemService = require('../services/systemService');

class SystemController {
  /**
   * 获取系统状态
   */
  static async getSystemStatus(req, res) {
    try {
      const status = await SystemService.getSystemStatus();
      res.json(status);
    } catch (error) {
      console.error('System status error:', error);
      res.status(500).json({ 
        error: '获取系统状态失败',
        message: error.message 
      });
    }
  }

  /**
   * 获取SSH信息（安全过滤）
   */
  static async getSSHInfo(req, res) {
    try {
      const { exec } = require('child_process');
      const fs = require('fs');
      
      // 检查是否需要刷新SSH信息
      const refresh = req.query.refresh === 'true';
      
      if (refresh) {
        // 重新生成SSH信息
        exec('/usr/local/bin/sshx -q > /tmp/.sshinfo 2>&1 &', (execErr) => {
          if (execErr) {
            console.error('SSH refresh error:', execErr);
          }
          
          // 等待文件生成
          setTimeout(() => {
            readAndReturnSSHInfo(res);
          }, 3000);
        });
      } else {
        // 直接读取现有信息
        readAndReturnSSHInfo(res);
      }
      
      function readAndReturnSSHInfo(response) {
        fs.readFile('/tmp/.sshinfo', 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading .sshinfo:', err);
            return response.status(500).json({
              status: 'unavailable',
              message: 'SSH服务未配置',
              timestamp: new Date().toISOString(),
              sshx: null
            });
          }
          
          // 检查文件内容
          if (data && data.includes('ssh')) {
            response.json({
              status: 'available',
              message: 'SSH服务已启动',
              timestamp: new Date().toISOString(),
              sshx: data.trim()
            });
          } else {
            response.json({
              status: 'unavailable',
              message: 'SSH服务未就绪',
              timestamp: new Date().toISOString(),
              sshx: data ? data.trim() : null
            });
          }
        });
      }
    } catch (error) {
      console.error('SSH info error:', error);
      res.status(500).json({
        status: 'error',
        message: '获取SSH信息失败',
        timestamp: new Date().toISOString(),
        sshx: null
      });
    }
  }

  /**
   * 执行系统命令（受限）
   */
  static async executeCommand(req, res) {
    try {
      const { command } = req.body;
      
      if (!command) {
        return res.status(400).json({
          error: '缺少command参数'
        });
      }

      const result = await SystemService.executeCommand(command);
      res.json(result);
    } catch (error) {
      console.error('Command execution error:', error);
      res.status(500).json({ 
        error: '命令执行失败',
        message: error.message 
      });
    }
  }

  /**
   * 获取应用详细信息
   */
  static async getAppInfo(req, res) {
    try {
      const { exec } = require('child_process');
      const os = require('os');

      exec('df -h', (err, stdout, stderr) => {
        if (err) {
          console.error(`exec error: ${err}`);
          return res.status(500).json({
            error: '获取磁盘信息失败',
            message: err.message
          });
        }

        const totalMemory = (os.totalmem() / (1024 ** 3)).toFixed(2);
        const freeMemory = (os.freemem() / (1024 ** 3)).toFixed(2);
        const cpus = os.cpus();
        const cpuModel = cpus[0].model;
        const cpuCores = cpus.length;

        const networkInterfaces = os.networkInterfaces();
        let ipAddress = 'N/A';
        for (const devName in networkInterfaces) {
          const iface = networkInterfaces[devName];
          for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
              ipAddress = alias.address;
              break;
            }
          }
          if (ipAddress !== 'N/A') break;
        }

        exec('curl -s ipinfo.io', (errPublicIp, stdoutPublicIp, stderrPublicIp) => {
          let publicIpInfo = {};
          if (!errPublicIp && stdoutPublicIp) {
            try {
              publicIpInfo = JSON.parse(stdoutPublicIp.trim());
            } catch (e) {
              console.error(`Error parsing public IP info: ${e}`);
            }
          }

          res.setHeader('Content-Type', 'text/plain');
          res.send(`Hello World!

Container Info:
  Hostname: ${os.hostname()}
  Platform: ${os.platform()}
  Arch: ${os.arch()}
  Uptime: ${os.uptime()} seconds
  UUID: ${process.env.UUID || 'Not Set'}

IP Info:
  Local IP Address: ${ipAddress}
  Public IP Address: ${publicIpInfo.ip || 'N/A'}
  Hostname: ${publicIpInfo.hostname || 'N/A'}
  City: ${publicIpInfo.city || 'N/A'}
  Region: ${publicIpInfo.region || 'N/A'}
  Country: ${publicIpInfo.country || 'N/A'}
  Location: ${publicIpInfo.loc || 'N/A'}
  Organization: ${publicIpInfo.org || 'N/A'}
  Postal: ${publicIpInfo.postal || 'N/A'}
  Timezone: ${publicIpInfo.timezone || 'N/A'}

CPU:
  Model: ${cpuModel}
  Cores: ${cpuCores}

Memory:
  Total: ${totalMemory} GB
  Free: ${freeMemory} GB

Disk Usage:
${stdout}`);
        });
      });
    } catch (error) {
      console.error('App info error:', error);
      res.status(500).json({
        error: '获取应用信息失败',
        message: error.message
      });
    }
  }

  /**
   * 健康检查接口
   */
  static async getHealthCheck(req, res) {
    try {
      const SystemService = require('../services/systemService');
      const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: SystemService.formatUptime(process.uptime())
      };
      
      res.json(healthData);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        error: '健康检查失败',
        message: error.message
      });
    }
  }
}

module.exports = SystemController;

// 此文件是一个模块
