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
    const timeInfo = this.getTimezoneInfo();
    
    return {
      timestamp: now.getTime(),
      iso: now.toISOString(),
      local: now.toLocaleString("zh-CN", { hour12: false }),
      // 分为两组数据
      timezones: timeInfo.regular,
      cities: timeInfo.cities
    };
  }

  /**
   * 获取多个时区的时间信息
   * @returns {Array} 时区信息数组
   */
  static getTimezoneInfo() {
    const now = new Date();
    const beijingTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
    
    const regular = [];
    const cities = [];
    
    timezones.forEach(tz => {
      const currentTzTime = new Date(now.toLocaleString("en-US", { timeZone: tz.timezone }));
      const timeDiff = Math.round((currentTzTime.getTime() - beijingTime.getTime()) / (1000 * 60 * 60));
      const diffText = timeDiff === 0 ? "基准" : (timeDiff > 0 ? `+${timeDiff}小时` : `${timeDiff}小时`);
      
      const timeData = {
        name: tz.name,
        label: tz.label,
        time: now.toLocaleString("zh-CN", {
          timeZone: tz.timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }),
        date: now.toLocaleDateString("zh-CN", {
          timeZone: tz.timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }),
        timeDiff: diffText,
        timeDiffValue: timeDiff
      };
      
      if (tz.group === "cities") {
        cities.push(timeData);
      } else {
        regular.push(timeData);
      }
    });
    
    // 城市按时差排序（从负到正）
    cities.sort((a, b) => a.timeDiffValue - b.timeDiffValue);
    
    return { regular, cities };
  }
}

module.exports = TimeService;

// 此文件是一个模块
