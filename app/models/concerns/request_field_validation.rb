module RequestFieldValidation
  extend ActiveSupport::Concern

  included do
    require 'autoinc'
    include Mongoid::Document
    include Mongoid::Autoinc
    include ActiveModel::Validations
    include Mongoid::Timestamps

    belongs_to :driver,   class_name: "Driver",  optional: true
    belongs_to :customer, class_name: "Customer"

    field :inc_id,             type: Integer
    field :status,             type: String, default: 'waiting'
    field :ongoing_at,         type: DateTime
    field :completed_at,       type: DateTime
    field :latitude,           type: Integer
    field :longitude,          type: Integer
    field :nearest_driver_ids, type: Array, default: []


    increments :inc_id, seed: 0

    ### INDEXES ####
    index({ inc_id: 1 })
    index({ status: 1 })
    ################

    # ENUMs
    STATUSES = %w(waiting ongoing complete)

    ####### validations #######
    validates :status, :inclusion => { :in => STATUSES }

    after_create :publish_ride_info_channel

    def publish_ride_info_channel
      driver_ids_list = self.nearest_driver_ids.map { |id| Driver.find(id).inc_id }

      message_to_publish = {
        :request => self.as_json(only: [:status], methods: [:customer_id, :request_time_elapsed, :request_id]),
        :driver_ids => driver_ids_list,
        :message_type => "ride_request"
      }
      Pusher.trigger('ride-request', 'ride-arrived', message_to_publish)
    end

  end
end
