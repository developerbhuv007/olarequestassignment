Rails.application.routes.draw do
  namespace :api, defaults: {format: :json} do
    namespace :v1 do

      # request routes
      get  "requests"       => "requests#index"
      get  "driver_requests"=> "requests#driver_requests"
      post "request"        => "requests#create"
      post "assign-request" => "requests#assign_request"

    end
  end
end
