module DriverFieldValidation
  extend ActiveSupport::Concern

  included do
    require 'autoinc'
    include Mongoid::Document
    include Mongoid::Autoinc
    include ActiveModel::Validations
    include Mongoid::Timestamps

    field :inc_id,      type: Integer

    increments :inc_id, seed: 0


    ### INDEXES ####
    index({ inc_id: 1 })
    ################
    
  end
end
