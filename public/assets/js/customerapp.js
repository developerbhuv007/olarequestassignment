$(document).ready(function() {
    $('#submitData').click(function(){
        postData($('#customer_id').val());
    });
});
async function postData(id){
    $response = '';
    await $.ajax({
        url: 'http://192.168.0.104:5000/api/v1/request',
        data: {'customer_id': id},
        method: 'POST',
        beforeSend: function(){
            $('#loading').css('display', 'block');
        },
        success: function(result){
            $('#loading').css('display', 'none');
            $response = result;
        },
        error: function(xhr, status, error){
            $response = error;
            $('#loading').css('display', 'none');
        }
    });
    updateData($response);
}
function updateData (response) {
    if(response.success){
        $('#customer_id').val('');
        $('#responseMsg').html('Request is raised, waiting for a driver...').css('color', '#09678c');
    }
    else{
        $('#responseMsg').html(response.messages.join(', ')).css('color', '#ff0000');;
    }
}