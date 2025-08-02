const fs = require('fs');
const path = require('path');
const TimeService = require('../services/timeService');
const config = require('../config/app');

class TimeController {
  /**
   * 渲染时间显示页面
   */
  static async renderTimePage(req, res) {
    try {
      // 读取HTML模板
      const templatePath = path.join(__dirname, '../views/templates/time.html');
      let html = fs.readFileSync(templatePath, 'utf8');
      
      // 简单的模板替换
      html = html.replace("{{title}}", config.app.name);
      html = html.replace('{{appName}}', config.app.name);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      console.error('Time page render error:', error);
      res.status(500).json({ 
        error: '页面渲染失败',
        message: error.message 
      });
    }
  }

  /**
   * 获取时间API数据
   */
  static async getTimeData(req, res) {
    try {
      const timeInfo = TimeService.getCurrentTimeInfo();
      res.json(timeInfo);
    } catch (error) {
      console.error('Time API error:', error);
      res.status(500).json({ 
        error: '获取时间信息失败',
        message: error.message 
      });
    }
  }

  /**
   * 获取特定时区时间
   */
  static async getTimezoneTime(req, res) {
    try {
      const { timezone } = req.params;
      const now = new Date();
      
      const timeString = now.toLocaleString('zh-CN', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      res.json({
        timezone,
        time: timeString,
        timestamp: now.getTime(),
        iso: now.toISOString()
      });
    } catch (error) {
      console.error('Timezone API error:', error);
      res.status(500).json({ 
        error: '获取时区时间失败',
        message: error.message 
      });
    }
  }
}

module.exports = TimeController;

// 此文件是一个模块
