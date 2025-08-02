// 时区配置
module.exports = {
  timezones: [
    { name: '北京时间', timezone: 'Asia/Shanghai', label: 'CST' },
    { name: '纽约时间', timezone: 'America/New_York', label: 'EST/EDT' },
    { name: '伦敦时间', timezone: 'Europe/London', label: 'GMT/BST' },
    { name: '东京时间', timezone: 'Asia/Tokyo', label: 'JST' },
    { name: 'UTC时间', timezone: 'UTC', label: 'UTC' }
  ],
  defaultTimezone: 'Asia/Shanghai'
};
