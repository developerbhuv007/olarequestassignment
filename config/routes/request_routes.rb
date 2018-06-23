Rails.application.routes.draw do
  namespace :api, defaults: {format: :json} do
    namespace :v1 do

      # request routes
      
    end
  end
  get '*unmatched_route', to: 'error#not_found'
end
