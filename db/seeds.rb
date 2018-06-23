
require 'csv'
require 'open-uri'

#commodity_file_path = "#{Rails.root}/tmp/commodity.csv"
#IO.copy_stream(download, commodity_file_path)
#CSV.foreach(commodity_file_path, :encoding => 'windows-1251:utf-8') do |row|
#  commodity = {hs_code: row[0], name: row[1]}
#  Commodity.create(commodity)
#end
# Add general commodity
#Commodity.create(:name => 'General')
#File.delete(commodity_file_path) if File.exist?(commodity_file_path)