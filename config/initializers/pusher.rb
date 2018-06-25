require 'pusher'

Pusher.app_id = Figaro.env.pusher_app_id
Pusher.key = Figaro.env.pusher_key
Pusher.secret = Figaro.env.pusher_secret
Pusher.cluster = Figaro.env.pusher_cluster
Pusher.logger = Rails.logger
Pusher.encrypted = true