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

    //initializing pubnub
    var $pubnub = new PubNub({
       publishKey : 'pub-c-4e7712e8-7488-4fe1-8f0d-af48b82b0656',
       subscribeKey : 'sub-c-47a91fd0-77d1-11e8-a728-026b18d394b5'
    })

    $pubnub.subscribe({
       channels: ["ride-request"]
    });

    // pubnub listener
    $pubnub.addListener({
       message: function(message) {
           console.log(message);
           if(message.message.message_type === 'ride_request'){
                if(message.message.driver_ids.indexOf(parseInt(params.id)) !== -1){
                    $('#waitingBox').append("<div class='waitingBox box' id='waitBox"+i+"'>"+
                        "<div class='row1'>"+
                            "<span>Req Id: <span id='reqIdWait"+i+"'>"+ message.message.request.request_id +"</span></span>"+
                            "<span>Cust Id: <span>"+ message.message.request.customer_id +"</span></span>"+
                        "</div>"+
                        "<div class='row2'>"+
                            "<span>"+ message.message.request.request_time_elapsed +" ago</span>"+
                        "</div>"+
                        "<div class='row3'>"+
                            "<button class='select' data-requestId="+ message.message.request.request_id +">Select</button>"+
                        "</div>"+
                    "</div>");
                }
           }
           else if(message.message.message_type === 'ride_already_assigned'){
               if(message.message.driver_ids.indexOf(parseInt(params.id)) !== -1){
                    for(var i=0; i < $('.waitingBox').length; i++){
                        if($('#reqIdWait'+i).html() == message.message.request.inc_id){
                            $('#waitBox'+i).remove();
                        }
                    }
               }
            }
            else if(message.message.message_type === 'ride_completed'){
                if(message.message.driver_ids.indexOf(parseInt(params.id)) !== -1){
                     for(var i=0; i < $('.waitingBox').length; i++){
                         if($('#reqIdOn'+i).html() == message.message.request.inc_id){
                            $('#onBox'+i).remove();
                            $('#ongoingBox').append("<div class='ongoing box' id='onBox"+i+"'>"+
                                "<div class='row1'>"+
                                    "<span>Req Id: <span id='reqIdOn"+i+"'>"+ message.message.request.request_id +"</span></span>"+
                                    "<span>Cust Id: <span>"+ message.message.request.customer_id +"</span></span>"+
                                "</div>"+
                                "<div class='row2'>"+
                                    "<span class='label'>Request:</span> <span>"+ message.message.request.request_time_elapsed +" ago</span>"+
                                "</div>"+
                                "<div class='row3'>"+
                                    "<span class='label'>Picked Up:</span> <span>"+ message.message.request.pickedup_time_elapsed +" ago</span>"+
                                "</div>"+
                            "</div>");
                         }
                     }
                }
             }
       }
    });

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
        url: '/api/v2/driver_requests',
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
        url: '/api/v2/assign-request',
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