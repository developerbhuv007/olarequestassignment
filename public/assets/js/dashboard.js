$(document).ready(function() {
    getData();
    $('#refresh').click(function(){
        getData();
    });
});

async function getData(){
    $response = '';
    await $.ajax({
        url: '/api/v1/requests',
        beforeSend: function(){
            $('#loading').css('display', 'block');
        },
        success: function(result){
            $response = result;
            $('#loading').css('display', 'none');
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
        $list = response.requests_list;
        $('#dashboardData').html("<tr>"+
            "<th>Request Id</th>"+
            "<th>Customer Id</th>"+
            "<th>Time Elapsed</th>"+
            "<th>Status</th>"+
            "<th>Driver</th>"+
        "</tr>");
        $.each($list, function(i, v){
            $('#dashboardData').append("<tr>"+
            "<td>"+ v.request_id +"</td>"+
            "<td>"+ v.customer_id +"</td>"+
            "<td>"+ v.complete_time_elapsed +"</td>"+
            "<td>"+ v.status +"</td>"+
            "<td>"+ v.driver_id +"</td>"+
        "</tr>");
        });
    }
    else {
        $('#tableWrap').html('No data!');
    }
}