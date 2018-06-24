module LogsHistoryFieldValidation
  extend ActiveSupport::Concern

  included do
    require 'autoinc'
    include Mongoid::Document
    include Mongoid::Autoinc
    include ActiveModel::Validations
    include Mongoid::Timestamps

    field :inc_id,           type: Integer
    field :error_type,       type: String
    field :error_message,    type: String

    increments :inc_id, seed: 0


    ### INDEXES ####
    index({ inc_id: 1 })
    ################
    
  end
end
