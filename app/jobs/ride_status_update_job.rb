class RideStatusUpdateJob
  @queue = :status_update_job_queue

  def self.perform
  	begin
  		Request.where(:status => "ongoing").each do |request|
	    	if ((Time.now - request.ongoing_at).to_i/60) >= 5
	    		status = request.update_attributes(:status => "complete", :complete_at => (request.ongoing_at + 5.minutes))
	    		if status
	    			# driver ids list to filterout to which drivers this should affect
				    begin 
				      driver_ids_list = [request.driver.inc_id]
				      message_to_publish = {
				        :request => request.as_json(only: [:status], methods: [:customer_id, :request_time_elapsed, :request_id, :pickedup_time_elapsed, :complete_time_elapsed]),
				        :driver_ids => driver_ids_list,
				        :message_type => "ride_completed"
				      }
			      	$pubnub.publish(
				      	channel: "ride-request",
				      	message: message_to_publish
				      )
			      rescue Exception => e
			      	LogsHistory.create(:error_type => "pubnub", :error_message => e.message)
			      end
	    		end
	    	end
	  	end
  	rescue Exception => e
  		LogsHistory.create(:error_type => "ride_status_update_job", :error_message => e.message)
  	end
    sleep(5)
  	Resque.enqueue(RideStatusUpdateJob)
  end

end