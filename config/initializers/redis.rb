redis = Redis.new(:host => Figaro.env.redis_host, :port => Figaro.env.redis_port)
$redis = Redis::Namespace.new(Figaro.env.redis_namespace, :redis => redis)
$redis_noti = Redis::Namespace.new(Figaro.env.redis_pub_namespace, :redis => redis)

worker_redis = Redis.new(:host => Figaro.env.worker_redis_host, :port => Figaro.env.redis_port)
$worker_redis = Redis::Namespace.new(Figaro.env.worker_redis_namespace, :redis => worker_redis)