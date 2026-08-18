// PM2 配置文件：用于开机自启 myblog 的文件监听自动部署任务
// 使用方式：
//   pm2 start ecosystem.config.cjs
//   pm2 save
module.exports = {
  apps: [
    {
      name: 'myblog-watch-deploy',
      cwd: __dirname,
      script: 'scripts/watch-deploy.mjs',
      interpreter: 'node',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
      },
      time: true,
    },
  ],
}
