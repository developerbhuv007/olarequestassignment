class Api::V1::RequestsController < ApiController
  
  # checking for request and driver id before assigning request to driver
  before_action :set_driver,  only: [:assign_request]
  before_action :set_request, only: [:assign_request]
  
  def index
  	success, messages, requests_list, page, total_pages = Request.get_all(request_params)
  	render :json => {success: success, messages: messages, requests_list: requests_list, page: page, total_pages: total_pages}
  end

  def create
  	success, messages, request_obj = Request.create_request(create_request_params)
  	render :json => {success: success, messages: messages, request_obj: request_obj}
  end

  def assign_request
  	success, messages, request_obj = Request.assign_request(assign_request_params)
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

  def request_params
  	params.permit(:status, :driver_id, :customer_id)
  end

  def create_request_params
  	params.permit(:customer_id)
  end

  def assign_request_params
    response = params.permit(:driver_id, :request_id)
    response.merge!({:driver => @driver, :request => @request})
    response
  end

end
