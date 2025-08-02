// 世界主要时区配置 - 经济和政治重要城市
module.exports = {
  timezones: [
    // 美洲主要时区
    { name: "纽约", timezone: "America/New_York", label: "UTC-5", region: "北美" },
    { name: "洛杉矶", timezone: "America/Los_Angeles", label: "UTC-8", region: "北美" },
    { name: "芝加哥", timezone: "America/Chicago", label: "UTC-6", region: "北美" },
    { name: "圣保罗", timezone: "America/Sao_Paulo", label: "UTC-3", region: "南美" },
    
    // 欧洲主要时区
    { name: "伦敦", timezone: "Europe/London", label: "UTC+0", region: "欧洲" },
    { name: "巴黎", timezone: "Europe/Paris", label: "UTC+1", region: "欧洲" },
    { name: "柏林", timezone: "Europe/Berlin", label: "UTC+1", region: "欧洲" },
    { name: "莫斯科", timezone: "Europe/Moscow", label: "UTC+3", region: "欧洲" },
    
    // 亚太主要时区
    { name: "北京", timezone: "Asia/Shanghai", label: "UTC+8", region: "亚洲" },
    { name: "东京", timezone: "Asia/Tokyo", label: "UTC+9", region: "亚洲" },
    { name: "首尔", timezone: "Asia/Seoul", label: "UTC+9", region: "亚洲" },
    { name: "新加坡", timezone: "Asia/Singapore", label: "UTC+8", region: "亚洲" },
    { name: "香港", timezone: "Asia/Hong_Kong", label: "UTC+8", region: "亚洲" },
    { name: "新德里", timezone: "Asia/Kolkata", label: "UTC+5:30", region: "亚洲" },
    { name: "悉尼", timezone: "Australia/Sydney", label: "UTC+10", region: "大洋洲" },
    
    // 中东非洲主要时区  
    { name: "迪拜", timezone: "Asia/Dubai", label: "UTC+4", region: "中东" },
    { name: "开罗", timezone: "Africa/Cairo", label: "UTC+2", region: "非洲" }
  ],
  defaultTimezone: 'Asia/Shanghai'
};
