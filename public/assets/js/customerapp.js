$(document).ready(function() {
    $('#submitData').click(function(){
        postData($('#customer_id').val());
    });
});
async function postData(id){
    $response = '';
    await $.ajax({
        url: '/api/v1/request',
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
            $('#loading').css('display', 'none');
            $('#responseMsg').html('Something went wrong!').css('color', '#ff0000');
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
        $('#responseMsg').html(response.messages.join(', ')).css('color', '#ff0000');
    }
}