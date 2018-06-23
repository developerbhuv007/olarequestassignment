Rails.application.routes.draw do
  namespace :api, defaults: {format: :json} do
    namespace :v1 do

      # request routes
      get  "requests"       => "requests#index"
      post "request"        => "requests#create"
      post "assign-request" => "requests#assign_request"

    end
  end
  get '*unmatched_route', to: 'error#not_found'
end
