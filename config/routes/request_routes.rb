Rails.application.routes.draw do
  namespace :api, defaults: {format: :json} do
    namespace :v1 do

      # request routes for version 1
      get  "requests"       => "requests#index"
      get  "driver_requests"=> "requests#driver_requests"
      post "request"        => "requests#create"
      post "assign-request" => "requests#assign_request"
    end

    namespace :v2 do

      # request routes for version 2
      get  "requests"       => "requests#index"
      get  "driver_requests"=> "requests#driver_requests"
      post "request"        => "requests#create"
      post "assign-request" => "requests#assign_request"
    end
  end
  get '*unmatched_route', :to => 'error#not_found'
end
