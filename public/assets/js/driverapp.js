var getParams = function (url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
};

var params = getParams(window.location.href);

$(document).ready(function() {
    $('#driverId').html(params.id);
    getData(params.id);
    $('#refresh').click(function(){
        getData(params.id);
    });
    $(document).on('click', '.select', function() {
        $requestId = $(this).attr('data-requestId');
        postData($requestId);
    });
});

async function getData(id){
    $response = '';
    await $.ajax({
        url: '/api/v1/driver_requests',
        data: {driver_id: id},
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
        $list = response.requests_list;
        $('#completeBox').html('');
        $('#waitingBox').html('');
        $('#ongoingBox').html('');
        $.each($list, function(i, v){
            if(v.status === 'complete'){
                $('#completeBox').append("<div class='completed box'>"+
                "<div class='row1'>"+
                    "<span>Req Id: <span>"+ v.request_id +"</span></span>"+
                    "<span>Cust Id: <span>"+ v.customer_id +"</span></span>"+
                "</div>"+
                "<div class='row2'>"+
                    "<span class='label'>Request:</span> <span>"+ v.request_time_elapsed +" ago</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<span class='label'>Picked Up:</span> <span>"+ v.pickedup_time_elapsed +" ago</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<span class='label'>Complete:</span> <span>"+ v.complete_time_elapsed +" ago</span>"+
                "</div>"+
            "</div>");
            }
            else if(v.status === 'waiting'){
                $('#waitingBox').append("<div class='waitingBox box'>"+
                "<div class='row1'>"+
                    "<span>Req Id: <span>"+ v.request_id +"</span></span>"+
                    "<span>Cust Id: <span>"+ v.customer_id +"</span></span>"+
                "</div>"+
                "<div class='row2'>"+
                    "<span>"+ v.request_time_elapsed +" ago</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<button class='select' data-requestId="+ v.request_id +">Select</button>"+
                "</div>"+
            "</div>");
            }
            else if(v.status === 'ongoing'){
                $('#ongoingBox').append("<div class='ongoing box'>"+
                "<div class='row1'>"+
                    "<span>Req Id: <span>"+ v.request_id +"</span></span>"+
                    "<span>Cust Id: <span>"+ v.customer_id +"</span></span>"+
                "</div>"+
                "<div class='row2'>"+
                    "<span class='label'>Request:</span> <span>"+ v.request_time_elapsed +" ago</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<span class='label'>Picked Up:</span> <span>"+ v.pickedup_time_elapsed +" ago</span>"+
                "</div>"+
            "</div>");
            }
        });
    }
}


async function postData(reqId){
    $response = '';
    await $.ajax({
        url: '/api/v1/assign-request',
        data: {'driver_id': params.id, 'request_id': reqId},
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
    postDataUpdate($response);
}

function postDataUpdate (response) {
    if(response.success){
        $('#responseMsg').html('Driver is assigned..').css('color', '#09678c');
    }
    else{
        $('#responseMsg').html(response.messages.join(', ')).css('color', '#ff0000');
    }
    getData(params.id);
}