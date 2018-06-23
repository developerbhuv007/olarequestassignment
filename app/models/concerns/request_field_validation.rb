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

    field :inc_id,       type: Integer
    field :status,       type: String, default: 'waiting'
    field :ongoing_at,   type: DateTime
    field :completed_at, type: DateTime

    increments :inc_id, seed: 0

    ### INDEXES ####
    index({ inc_id: 1 })
    index({ status: 1 })
    ################

    # ENUMs
    STATUSES = %w(waiting ongoing complete)

    ####### validations #######
    validates :status, :inclusion => { :in => STATUSES}
    
  end
end
