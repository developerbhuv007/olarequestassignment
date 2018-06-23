class Request
  include RequestFieldValidation

  def self.get_all(query_params)
  	success, messages, filters = get_request_filters(query_params)
    if !success
      return success, messages, []
    end
  	requests = self.where(filters)
  	# updating the request status if time elapsed is 5 or more than 5 minutes after coming to ongoing status
  	requests.each do |obj|
  		if obj[:status] == "ongoing"
  			time_elapsed = (Time.now - obj[:ongoing_at]).to_i/60
  			if time_elapsed >= 5
  				obj[:status] = "complete"
  				obj[:completed_at] = obj[:ongoing_at] + 5.minutes
  				obj.update_attributes(:status => "complete", :completed_at => (obj[:ongoing_at] + 5.minutes))
  			end
  		end
  	end
  	requests = requests.as_json(only: [:status], methods: [:request_id, :customer_id, :driver_id, :request_time_elapsed, :pickedup_time_elapsed, :complete_time_elapsed])
  	return true, [], requests
  end

  def self.get_driver_requests(query_params)
    filters = get_driver_requests_filters(query_params)
    waiting_requests = Request.where(:status => "waiting")
    other_requests = self.where(filters.merge(:status.in => ["ongoing", "complete"]))
    requests = waiting_requests + other_requests
    requests = requests.as_json(only: [:status], methods: [:request_id, :customer_id, :driver_id, :request_time_elapsed, :pickedup_time_elapsed, :complete_time_elapsed])
    return true, [], requests
  end

  def self.create_request(query_params)
  	# first will create customer
  	# then will create request since it belongs to the specified customer
  	return false, ["Customer id is required!"], {} unless query_params[:customer_id].present?
  	@customer = Customer.create(:customer_id => query_params[:customer_id])
  	if @customer.present?
  		request = Request.create(:customer => @customer)
  		return true, [], request.as_json
  	else
  		return false, ["Error creating customer!"], {}
  	end
  end

  def self.assign_request(query_params)
  	# checking for request status before assignment
  	# also checking for driver is busy or not since he/she can only do one ride at a time
  	return false, ["Request no longer available!"], {} unless query_params[:request].status == "waiting"
  	requests = Request.where(:status => "ongoing", :driver_id => query_params[:driver].id).select { |obj| ((Time.now - obj.ongoing_at).to_i/60) < 5 }
  	return false, ["Driver is already serving a ride!"], {} if requests.count > 0
  	success = query_params[:request].update_attributes(:status => "ongoing", :ongoing_at => Time.now, :driver => query_params[:driver])
  	query_params[:request][:status] = "ongoing"
  	query_params[:request][:ongoing_at] = Time.now
  	query_params[:request][:driver_id] = query_params[:driver].id
  	return success, [], query_params[:request]
  end


  def self.get_request_filters(query_params)
  	filters = {}
    success = true
    messages = []
  	filters.merge!(:status => query_params[:status]) unless query_params[:status].blank?
    if query_params[:driver_id].present?
      @driver = Driver.find_by(:inc_id => query_params[:driver_id].to_i) rescue nil
      if @driver.nil?
        success, messages = false, ["Driver not found!"]
      else
        filters.merge!(:driver_id => @driver.id)
      end
    end

    if query_params[:customer_id].present?
      @customer = Customer.find_by(:inc_id => query_params[:customer_id].to_i) rescue nil
      if @customer.nil?
        success, messages = false, ["Customer not found!"]
      else
        filters.merge!(:customer_id => @customer.id)
      end
    end
  	return success, messages, filters
  end

  def self.get_driver_requests_filters(query_params)
    filters = {}
    filters.merge!(:status => query_params[:status]) unless query_params[:status].blank?
    filters.merge!(:driver_id => query_params[:driver].id)
    filters
  end

  def get_elapsed_time(time_in_seconds)
  	hours = time_in_seconds / (60 * 60)
    minutes = (time_in_seconds / 60) % 60
    seconds = time_in_seconds % 60

    if hours > 0
    	"#{ hours } hour #{ minutes } min #{ seconds } sec"
    elsif minutes > 0
    	"#{ minutes } min #{ seconds } sec"
    else
    	"#{ seconds } sec"
    end
  end

  def request_id
  	self.inc_id
 	end 

 	def customer_id
 		self.customer.inc_id
 	end

 	def driver_id
 		self.driver.inc_id rescue nil
 	end

 	def request_time_elapsed
 		get_elapsed_time((Time.now - self.created_at).to_i)
 	end

 	def pickedup_time_elapsed
 		get_elapsed_time((Time.now - self.ongoing_at).to_i) rescue nil
	end

	def complete_time_elapsed
		get_elapsed_time((Time.now - self.completed_at).to_i) rescue nil
	end
  
end
