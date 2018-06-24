redis = Redis.new(:host => Figaro.env.redis_host, :port => Figaro.env.redis_port)
Resque.redis = redis
Resque.redis.namespace = Figaro.env.resque_redis_namespace

require 'resque-scheduler'
require 'resque/scheduler/server'