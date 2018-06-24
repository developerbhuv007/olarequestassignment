$(document).ready(function() {
    $('#submitData').click(function(){
        if($('#customer_id').val() === ''){
            $('#responseMsg').html('Customer id is required!').css('color', '#ff0000');
            return;
        }
        if($('#latitude').val() === ''){
            $('#responseMsg').html('Latitude is required!').css('color', '#ff0000');
            return;
        }
        if($('#latitude').val() > 5 || $('#latitude').val() < 0){
            $('#responseMsg').html('Latitude value should be between 0 to 5').css('color', '#ff0000');
            return;
        }
        if($('#longitude').val() === ''){
            $('#responseMsg').html('Longitude is required!').css('color', '#ff0000');
            return;
        }
        if($('#longitude').val() > 5 || $('#latitude').val() < 0){
            $('#responseMsg').html('Longitude value should be between 0 to 5').css('color', '#ff0000');
            return;
        }
        postData($('#customer_id').val(), $('#latitude').val(), $('#longitude').val()) ;
    });
});
async function postData(id, lat, long){
    $response = '';
    await $.ajax({
        url: '/api/v2/request',
        data: {'customer_id': id, 'latitude': lat, 'longitude': long},
        method: 'POST',
        beforeSend: function(){
            $('#loading').css('display', 'block');
        },
        success: function(result){
            $('#loading').css('display', 'none');
            $response = result;
        },
        error: function(xhr, status, error){
            $('#loading').css('display', 'none');
            $('#responseMsg').html('Something went wrong!').css('color', '#ff0000');
        }
    });
    updateData($response);
}
function updateData (response) {
    if(response.success){
        $('#customer_id').val('');
        $('#latitude').val('');
        $('#longitude').val('');
        $('#responseMsg').html('Request is raised, waiting for a driver...').css('color', '#09678c');
    }
    else{
        $('#responseMsg').html(response.messages.join(', ')).css('color', '#ff0000');
    }
}