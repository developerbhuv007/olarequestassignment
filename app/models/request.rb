class Request
  include RequestFieldValidation

  def self.get_all(query_params)
  	filters = get_request_filters(query_params)
  	total_requests = self.where(filters)
  	total_pages = (total_requests.count.to_f/PER_PAGE_LIMIT).ceil
  	page = (query_params[:page] || 1).to_i
  	requests = total_requests.limit(PER_PAGE_LIMIT).offset((page - 1)*PER_PAGE_LIMIT)

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
  	return true, [], requests, page, total_pages
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
  	filters.merge!(:status => query_params[:status]) unless query_params[:status].blank?
  	filters.merge!(:customer_id => query_params[:customer_id]) unless query_params[:customer_id].blank?
  	filters.merge!(:driver_id => query_params[:driver_id]) unless query_params[:driver_id].blank?
  	filters
  end
  
end
