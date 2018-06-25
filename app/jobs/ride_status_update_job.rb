class RideStatusUpdateJob
  @queue = :status_update_job_queue

  def self.perform
  	while true
  		begin
	  		Request.where(:status => "ongoing").each do |request|
	  			byebug
		    	if ((Time.now - request.ongoing_at).to_i/60) >= 1
		    		# status = request.update_attributes(:status => "complete", :completed_at => (request.ongoing_at + 5.minutes))
		    		if status
		    			puts "status " 
					    puts request.publish_ride_complete_message
		    		end
		    	end
		  	end
	  	rescue Exception => e
	  		LogsHistory.create(:error_type => "ride_status_update_job", :error_message => e.message)
	  	end
	    sleep(5)	
  	end
  	# Resque.enqueue(RideStatusUpdateJob)
  end

end