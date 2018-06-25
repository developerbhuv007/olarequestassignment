class Api::V2::RequestsController < ApiController
  
  # checking for request and driver id before assigning request to driver
  before_action :set_driver,  only: [:assign_request, :driver_requests]
  before_action :set_request, only: [:assign_request]
  
  def index
  	success, messages, requests_list = Request.get_all_v2(request_params)
  	render :json => {success: success, messages: messages, requests_list: requests_list}
  end

  def driver_requests
    Pusher.trigger('my-channel', 'my-event', {
      message: 'hello world'
    })
  	success, messages, requests_list = Request.get_driver_requests_v2(driver_requests_params)
  	render :json => {success: success, messages: messages, requests_list: requests_list}
  end

  def create
  	success, messages, request_obj = Request.create_request_v2(create_request_params)
  	render :json => {success: success, messages: messages, request_obj: request_obj}
  end

  def assign_request
  	success, messages, request_obj = Request.assign_request_v2(assign_request_params)
  	render :json => {success: success, messages: messages, request_obj: request_obj}
  end


  private

  def set_driver
  	@driver = Driver.find_by(inc_id: params[:driver_id].to_i) rescue nil
  	if @driver.nil?
      render :json => {success: false, messages: ["Driver not found!"], request_obj: {}}
  	end
  end

  def set_request
  	@request = Request.find_by(inc_id: params[:request_id].to_i) rescue nil
  	if @request.nil?
      render :json => {success: false, messages: ["Request not found!"], request_obj: {}}
  	end
  end

  def driver_requests_params
  	response = params.permit(:driver_id, :status)
  	response.merge!(:driver => @driver)
  end	

  def request_params
  	params.permit(:status, :driver_id, :customer_id)
  end

  def create_request_params
  	params.permit(:customer_id, :latitude, :longitude)
  end

  def assign_request_params
    response = params.permit(:driver_id, :request_id)
    response.merge!({:driver => @driver, :request => @request})
    response
  end

end
