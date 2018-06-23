class ApplicationController < ActionController::API
  include ActionController::MimeResponds

  rescue_from ActionController::ParameterMissing, :with => :parameter_missing
  rescue_from ::NameError, with: :error_occurred

  protected

  def parameter_missing(exception)
  	render json: { success: false, messages: [ "#{exception.param.capitalize} is a required field" ], status: 400 }.to_json, :status => 400
  end

	def error_occurred(exception)
	  render json: {success: false, messages: [exception.message], status: 500}.to_json, status: 500
	end

end
