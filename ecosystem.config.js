module.exports = {
    apps : [

    // First application
    {
      name      : 'API',
      script    : 'api/api.js',
      watch     : true,
      max_memory_restart : "200M",
      instances : 1,
      exec_mode : "cluster",
      env: {
        COMMON_VARIABLE: 'true'
      },
	//       env_production : {
	//         NODE_ENV: 'production'
	//       }
    },

    // Second application
    {
      name      : 'UDP',
      script    : 'api/udp.js',
      watch     : true,
      max_memory_restart : "200M",
      instances : 2,
      exec_mode : "cluster",
      
    }
  ],

//  deploy : {
//    production : {
//      user : 'node',
//      host : '212.83.163.1',
//      ref  : 'origin/master',
//      repo : 'git@github.com:repo.git',
//      path : '/var/www/production',
//      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
//    }
//  }

};
