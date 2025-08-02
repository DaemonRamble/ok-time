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
      const sshInfo = await SystemService.getSSHInfo();
      res.json(sshInfo);
    } catch (error) {
      console.error('SSH info error:', error);
      res.status(500).json({ 
        error: '获取SSH信息失败',
        message: error.message 
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
}

module.exports = SystemController;

// 此文件是一个模块
