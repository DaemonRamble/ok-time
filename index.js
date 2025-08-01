const http = require('http');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// Helper function to format uptime in "1m54.343292881s" format
function formatUptime(seconds) {
  const totalMs = seconds * 1000;
  const ms = totalMs % 1000;
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

// Generate beautiful HTML time page
function generateTimeHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ok-time - 时间显示</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            overflow: hidden;
        }
        
        .time-container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 3rem 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 90vw;
            animation: fadeIn 1s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .title {
            font-size: 2rem;
            font-weight: 300;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .time-display {
            font-size: 4rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            letter-spacing: 2px;
        }
        
        .date-display {
            font-size: 1.5rem;
            font-weight: 300;
            margin-bottom: 2rem;
            opacity: 0.8;
        }
        
        .timezone-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .timezone-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .timezone-label {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-bottom: 0.5rem;
        }
        
        .timezone-time {
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        @media (max-width: 768px) {
            .time-container {
                padding: 2rem 1rem;
            }
            
            .title {
                font-size: 1.5rem;
            }
            
            .time-display {
                font-size: 2.5rem;
            }
            
            .date-display {
                font-size: 1.2rem;
            }
            
            .timezone-info {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 480px) {
            .time-display {
                font-size: 2rem;
            }
            
            .title {
                font-size: 1.2rem;
            }
        }
    </style>
</head>
<body>
    <div class="time-container">
        <h1 class="title">🕐 当前时间</h1>
        <div class="time-display" id="current-time">--:--:--</div>
        <div class="date-display" id="current-date">---- 年 -- 月 -- 日 星期-</div>
        
        <div class="timezone-info">
            <div class="timezone-card">
                <div class="timezone-label">本地时间</div>
                <div class="timezone-time" id="local-time">--:--:--</div>
            </div>
            <div class="timezone-card">
                <div class="timezone-label">UTC 时间</div>
                <div class="timezone-time" id="utc-time">--:--:--</div>
            </div>
            <div class="timezone-card">
                <div class="timezone-label">服务器运行时间</div>
                <div class="timezone-time" id="server-uptime">-- 秒</div>
            </div>
        </div>
    </div>

    <script>
        const serverStartTime = Date.now();
        
        function updateTime() {
            const now = new Date();
            
            // 主要时间显示
            const timeString = now.toLocaleTimeString('zh-CN', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('current-time').textContent = timeString;
            
            // 日期显示
            const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
            const dateString = \`\${now.getFullYear()} 年 \${(now.getMonth() + 1).toString().padStart(2, '0')} 月 \${now.getDate().toString().padStart(2, '0')} 日 星期\${weekdays[now.getDay()]}\`;
            document.getElementById('current-date').textContent = dateString;
            
            // 本地时间
            document.getElementById('local-time').textContent = timeString;
            
            // UTC 时间
            const utcString = now.toLocaleTimeString('en-US', {
                timeZone: 'UTC',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('utc-time').textContent = utcString;
            
            // 服务器运行时间（模拟）
            const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            document.getElementById('server-uptime').textContent = \`\${hours}h \${minutes}m \${seconds}s\`;
        }
        
        // 立即更新一次
        updateTime();
        
        // 每秒更新
        setInterval(updateTime, 1000);
    </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // Beautiful HTML time page
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(generateTimeHTML());
  } else if (req.url === '/info') {
    // System information (moved from original /)
    exec('df -h', (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error getting disk info');
        return;
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
        } else {
          console.error(`Error getting public IP info: ${errPublicIp || stderrPublicIp}`);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`
Hello World!

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
${stdout}
        `);
      });
    });
  } else if (req.url === '/health') {
    // Health check endpoint
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: formatUptime(process.uptime())
    };
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(healthData));
  } else if (req.url === '/ssh') {
    // SSH info (unchanged)
    fs.readFile('/tmp/.sshinfo', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading .sshinfo:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error: Could not read .sshinfo');
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end(data);
    });
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
