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

    // //initializing pubnub
    // var $pubnub = new PubNub({
    //    publishKey : 'pub-c-2bcb63a4-1624-4030-9c41-9e86289dda08',
    //    subscribeKey : 'sub-c-530a60fa-77f9-11e8-af21-a6b3764c9f3f'
    // })

    // $pubnub.subscribe({
    //    channels: ["ride-request"]
    // });

    // // pubnub listener
    // $pubnub.addListener({
    //    message: function(message) {
    //        // console.log(message);
    //        if(message.message.message_type === 'ride_request'){
    //             if(message.message.driver_ids.indexOf(parseInt(params.id)) !== -1){
    //                 var k = $('.waitingBox').length;
    //                 $('#waitingBox').append("<div class='waitingBox box' id='waitBox"+k+"'>"+
    //                     "<div class='row1'>"+
    //                         "<span>Req Id: <span id='reqIdWait"+k+"'>"+ message.message.request.request_id +"</span></span>"+
    //                         "<span>Cust Id: <span>"+ message.message.request.customer_id +"</span></span>"+
    //                     "</div>"+
    //                     "<div class='row2'>"+
    //                         "<span>"+ message.message.request.request_time_elapsed +" ago</span>"+
    //                     "</div>"+
    //                     "<div class='row3'>"+
    //                         "<button class='select' data-requestId="+ message.message.request.request_id +">Select</button>"+
    //                     "</div>"+
    //                 "</div>");
    //             }
    //        }
    //        else if(message.message.message_type === 'ride_already_assigned'){
    //            if(message.message.driver_ids.indexOf(parseInt(params.id)) !== -1){
    //                 for(var i=0; i < $('.waitingBox').length; i++){
    //                     if($('#reqIdWait'+i).html() == message.message.request.inc_id){
    //                         $('#waitBox'+i).remove();
    //                         var id = 0;
    //                         $('.waitingBox').each(function(){
    //                           if ($(this).attr('id') !== ("waitBox" + id)){
    //                             var request_id = $(this).attr('id').replace("waitBox", "reqIdWait")
    //                             $(this).attr("id", ("waitBox" + id));
    //                             $("#" + request_id).attr("id", ("reqIdWait" + id))
    //                           }
    //                           id = id + 1;
    //                         });
    //                         return false;
    //                     }
    //                 }
    //            }
    //         }
    //         else if(message.message.message_type === 'ride_completed'){
    //             if(message.message.driver_ids.indexOf(parseInt(params.id)) !== -1){
    //                  for(var i=0; i < $('.ongoing').length; i++){
    //                      if($('#reqIdOn'+i).html() == message.message.request.request_id){
    //                         $('#onBox'+i).remove();
    //                         $('#completeBox').append("<div class='completed box'>"+
    //                             "<div class='row1'>"+
    //                                 "<span>Req Id: <span>"+ message.message.request.request_id +"</span></span>"+
    //                                 "<span>Cust Id: <span>"+ message.message.request.customer_id +"</span></span>"+
    //                             "</div>"+
    //                             "<div class='row2'>"+
    //                                 "<span class='label'>Request:</span> <span>"+ message.message.request.request_time_elapsed +" ago</span>"+
    //                             "</div>"+
    //                             "<div class='row3'>"+
    //                                 "<span class='label'>Picked Up:</span> <span>"+ message.message.request.pickedup_time_elapsed +" ago</span>"+
    //                             "</div>"+
    //                             "<div class='row3'>"+
    //                                 "<span class='label'>Complete:</span> <span>"+ message.message.request.complete_time_elapsed +" ago</span>"+
    //                             "</div>"+
    //                         "</div>");
    //                      }
    //                  }
    //             }
    //          }
    //    }
    // });

    Pusher.logToConsole = true;

    var pusher = new Pusher('634bcc3a90137cfc5b38', {
      cluster: 'ap2',
      encrypted: true
    });

    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
      console.log("My custom log");
      console.log(data);
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
        var waiting_count = 0;
        var ongoing_count = 0;
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
                $('#waitingBox').append("<div class='waitingBox box' id='waitBox"+waiting_count+"'>"+
                "<div class='row1'>"+
                    "<span>Req Id: <span id='reqIdWait"+waiting_count+"'>"+ v.request_id +"</span></span>"+
                    "<span>Cust Id: <span>"+ v.customer_id +"</span></span>"+
                "</div>"+
                "<div class='row2'>"+
                    "<span>"+ v.request_time_elapsed +" ago</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<button class='select' data-requestId="+ v.request_id +">Select</button>"+
                "</div>"+
            "</div>");
                waiting_count = waiting_count + 1;
            }
            else if(v.status === 'ongoing'){
                $('#ongoingBox').append("<div class='ongoing box' id='onBox"+ongoing_count+"'>"+
                "<div class='row1'>"+
                    "<span>Req Id: <span id='reqIdOn"+ongoing_count+"'>"+ v.request_id +"</span></span>"+
                    "<span>Cust Id: <span>"+ v.customer_id +"</span></span>"+
                "</div>"+
                "<div class='row2'>"+
                    "<span class='label'>Request:</span> <span>"+ v.request_time_elapsed +" ago</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<span class='label'>Picked Up:</span> <span>"+ v.pickedup_time_elapsed +" ago</span>"+
                "</div>"+
            "</div>");
                ongoing_count = ongoing_count + 1;
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