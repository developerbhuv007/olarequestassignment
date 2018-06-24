require 'pubnub'
$pubnub = Pubnub.new(
   subscribe_key: : Figaro.env.subscribe_key,
   publish_key: : Figaro.env.publish_key
)