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

  def self.create_request(query_params)
  	# first will create customer
  	# then will create request since it belongs to the specified customer
  	return false, ["Customer id is required!"], {} unless query_params[:customer_id].present?
    return false, ["Customer id already registered!"], {} if Customer.where(:customer_id => query_params[:customer_id]).count > 0 
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

  ## version 2 methods

  def self.get_all_v2(query_params)
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
    requests = requests.as_json(only: [:status, :latitude, :longitude], methods: [:request_id, :customer_id, :driver_id, :request_time_elapsed, :pickedup_time_elapsed, :complete_time_elapsed])
    return true, [], requests
  end

  def self.get_driver_requests_v2(query_params)
    filters = get_driver_requests_filters(query_params)
    waiting_requests = Request.where(:status => "waiting", :nearest_driver_ids => query_params[:driver].id)
    if filters[:status].blank?
      filters.merge!(:status.in => ["ongoing", "complete"])
    end
    other_requests = self.where(filters)
    requests = waiting_requests + other_requests
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
    requests = requests.as_json(only: [:status, :latitude, :longitude], methods: [:request_id, :customer_id, :driver_id, :request_time_elapsed, :pickedup_time_elapsed, :complete_time_elapsed])
    return true, [], requests
  end

  def self.create_request_v2(query_params)
    # first will create customer
    # then will create request since it belongs to the specified customer
    return false, ["Customer id is required!"], {} unless query_params[:customer_id].present?
    return false, ["Customer id already registered!"], {} if Customer.where(:customer_id => query_params[:customer_id]).count > 0
    return false, ["Rides not available. Try again later!"], {} if Request.where(:status => "waiting").count > 10

    @customer = Customer.create(:customer_id => query_params[:customer_id])
    if @customer.present?
      nearest_driver_ids = get_nearest_drivers(query_params)
      request = Request.create(:customer => @customer, :latitude => query_params[:latitude].to_i, :longitude => query_params[:longitude].to_i, :nearest_driver_ids => nearest_driver_ids)
      return true, [], request.as_json
    else
      return false, ["Error creating customer!"], {}
    end
  end

  def self.assign_request_v2(query_params)
    # checking for request status before assignment
    # also checking for driver is busy or not since he/she can only do one ride at a time
    return false, ["Request no longer available!"], {} unless query_params[:request].status == "waiting"
    requests = Request.where(:status => "ongoing", :driver_id => query_params[:driver].id).select { |obj| ((Time.now - obj.ongoing_at).to_i/60) < 5 }
    return false, ["Driver is already serving a ride!"], {} if requests.count > 0
    success = query_params[:request].update_attributes(:status => "ongoing", :ongoing_at => Time.now, :driver => query_params[:driver])
    query_params[:request][:status] = "ongoing"
    query_params[:request][:ongoing_at] = Time.now
    query_params[:request][:driver_id] = query_params[:driver].id
    if success
      # driver ids list to filterout to which drivers this should affect
      driver_ids_list = query_params[:request].nearest_driver_ids - [query_params[:driver].id]
      driver_ids_list = driver_ids_list.map { |id| Driver.find(id).inc_id  }
      message_to_publish = {
        :request => query_params[:request].as_json,
        :driver_ids => driver_ids_list,
        :message_type => "ride_already_assigned"
      }
      $pubnub.publish(
      channel: "ride-request",
      message: message_to_publish
      )
    end
    
    return success, [], query_params[:request]
  end

  def self.get_nearest_drivers(query_params)
    distance_hash_array = []
    Driver.each do |driver|
      distance = get_distance(driver.latitude, driver.longitude, query_params[:latitude].to_i, query_params[:longitude].to_i)
      distance_hash_array << {:id => driver.id, :distance => distance}
    end
    distance_hash_array.sort_by { |e| e[:distance] }[0..2].map { |e| e[:id] }
  end

  def self.get_distance(driver_lat, driver_lng, request_lat, request_lng)
    distance = (driver_lat - request_lat)*(driver_lat - request_lat) + (driver_lng - request_lng)*(driver_lng - request_lng)
    distance = Math.sqrt(distance) 
  end

  ## common methods

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

  def publish_ride_complete_message
    driver_ids_list = [self.driver.inc_id]
    message_to_publish = {
      :request => self.as_json(only: [:status], methods: [:customer_id, :request_time_elapsed, :request_id, :pickedup_time_elapsed, :complete_time_elapsed]),
      :driver_ids => driver_ids_list,
      :message_type => "ride_completed"
    }
    $pubnub.publish(
      channel: "ride-request",
      message: message_to_publish
    )
  end

  def request_id
  	self.inc_id
 	end 

 	def customer_id
 		self.customer.customer_id
 	end

 	def driver_id
 		self.driver.inc_id rescue 'N/A'
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
