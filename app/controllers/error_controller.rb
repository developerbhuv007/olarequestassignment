class ErrorController < ApiController
  
  def not_found
    render json: {success: false, messages: "Route not found!", status: 404}, :status => 404
  end
  
end