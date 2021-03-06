class RideStatusUpdateJob
  @queue = :status_update_job_queue

  def self.perform
  	while true
  		begin
	  		Request.where(:status => "ongoing").each do |request|
		    	if ((Time.now - request.ongoing_at).to_i/60) >= 5
		    		status = request.update_attributes(:status => "complete", :completed_at => (request.ongoing_at + 5.minutes))
		    		if status
					    request.publish_ride_complete_message
		    		end
		    	end
		  	end
	  	rescue Exception => e
	  		LogsHistory.create(:error_type => "ride_status_update_job", :error_message => e.message)
	  	end
	  	## giving 5 seconds pause for the worker to restart its script
	    sleep(5)	
  	end
  end

end