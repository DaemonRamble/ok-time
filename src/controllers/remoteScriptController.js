const RemoteScriptService = require('../services/remoteScriptService');

// 全局服务实例（单例模式）
let remoteScriptServiceInstance = null;

class RemoteScriptController {
  /**
   * 获取服务实例
   */
  static getServiceInstance() {
    if (!remoteScriptServiceInstance) {
      remoteScriptServiceInstance = new RemoteScriptService();
    }
    return remoteScriptServiceInstance;
  }

  /**
   * 获取远程脚本执行状态
   */
  static async getExecutionStatus(req, res) {
    try {
      const service = RemoteScriptController.getServiceInstance();
      const results = service.getLastExecutionResults();
      
      res.json({
        success: true,
        data: results,
        message: '获取执行状态成功'
      });
    } catch (error) {
      console.error('获取远程脚本状态失败:', error);
      res.status(500).json({
        success: false,
        message: '获取执行状态失败',
        error: error.message
      });
    }
  }

  /**
   * 手动触发远程脚本执行
   */
  static async triggerExecution(req, res) {
    try {
      const service = RemoteScriptController.getServiceInstance();
      const results = await service.triggerExecution();
      
      res.json({
        success: true,
        data: results,
        message: '远程脚本执行触发成功'
      });
    } catch (error) {
      console.error('触发远程脚本执行失败:', error);
      res.status(400).json({
        success: false,
        message: '触发执行失败',
        error: error.message
      });
    }
  }

  /**
   * 获取远程脚本配置信息
   */
  static async getConfiguration(req, res) {
    try {
      const config = require('../config/app').remoteScripts;
      
      // 不暴露具体的URL（安全考虑）
      const safeConfig = {
        enabled: config.enabled,
        delay: config.delay,
        timeout: config.timeout,
        retryAttempts: config.retryAttempts,
        retryDelay: config.retryDelay,
        urlCount: config.urls.length,
        urls: config.urls.map(url => {
          // 只显示域名，隐藏具体路径
          try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.host}/***`;
          } catch {
            return '***';
          }
        })
      };

      res.json({
        success: true,
        data: safeConfig,
        message: '获取配置信息成功'
      });
    } catch (error) {
      console.error('获取远程脚本配置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取配置信息失败',
        error: error.message
      });
    }
  }
}

module.exports = RemoteScriptController;

// 此文件是一个模块
