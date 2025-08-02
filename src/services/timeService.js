const { timezones, defaultTimezone } = require('../config/timezones');

class TimeService {
  /**
   * 格式化运行时间
   * @param {number} seconds - 秒数
   * @returns {string} 格式化的时间字符串
   */
  static formatUptime(seconds) {
    const totalMs = seconds * 1000;
    const ms = Math.floor(totalMs % 1000);
    const totalSeconds = Math.floor(totalMs / 1000);
    const s = totalSeconds % 60;
    const m = Math.floor(totalSeconds / 60) % 60;
    const h = Math.floor(totalSeconds / 3600) % 24;
    const d = Math.floor(totalSeconds / 86400);

    let result = '';
    if (d > 0) result += `${d}d`;
    if (h > 0) result += `${h}h`;
    if (m > 0) result += `${m}m`;
    result += `${s}.${ms.toString().padStart(3, '0')}s`;
    
    return result;
  }

  /**
   * 获取当前时间信息
   * @returns {Object} 时间信息对象
   */
  static getCurrentTimeInfo() {
    const now = new Date();
    
    return {
      timestamp: now.getTime(),
      iso: now.toISOString(),
      local: now.toLocaleString('zh-CN', {
        timeZone: defaultTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      timezones: this.getTimezoneInfo()
    };
  }

  /**
   * 获取多个时区的时间信息
   * @returns {Array} 时区信息数组
   */
  static getTimezoneInfo() {
    const now = new Date();
    
    return timezones.map(tz => ({
      name: tz.name,
      label: tz.label,
      time: now.toLocaleString('zh-CN', {
        timeZone: tz.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      date: now.toLocaleDateString('zh-CN', {
        timeZone: tz.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }));
  }
}

module.exports = TimeService;

// 此文件是一个模块
