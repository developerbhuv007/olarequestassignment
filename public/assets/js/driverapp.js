$(document).ready(function() {
    $params = getParams(window.location.href);
    $('#driverId').html($params.id);
    getData($params.id);
    $('#refresh').click(function(){
        getData($params.id);
    });
    $(document).on('click', '.select', function() {
        $requestId = $(this).attr('data-requestId');
        postData($requestId);
    });
});

async function getData(id){
    $response = '';
    await $.ajax({
        url: 'http://192.168.0.104:5000/api/v1/driver_requests',
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
            $response = error;
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
                    "<span class='label'>Request:</span> <span>"+ v.request_time_elapsed +"</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<span class='label'>Pickup:</span> <span>"+ v.pickedup_time_elapsed +"</span>"+
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
                    "<span>"+ v.request_time_elapsed +"</span>"+
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
                    "<span class='label'>Request:</span> <span>"+ v.request_time_elapsed +"</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<span class='label'>Pickup:</span> <span>"+ v.pickedup_time_elapsed +"</span>"+
                "</div>"+
            "</div>");
            }
        });
    }
}


async function postData(reqId){
    $params = getParams(window.location.href);
    $response = '';
    await $.ajax({
        url: 'http://192.168.0.104:5000/api/v1/assign-request',
        data: {'driver_id': $params.id, 'request_id': reqId},
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
            $response = error;
        }
    });
    postDataUpdate($response);
}

function postDataUpdate (response) {
    if(response.success){
        $('#responseMsg').html('Driver is assigned..').css('color', '#09678c');
        getData();
    }
    else{
        $('#responseMsg').html(response.messages.join(', ')).css('color', '#ff0000');;
    }
}

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