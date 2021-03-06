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

    // Pusher.logToConsole = true;
    // Initializing pusher
    
    var pusher = new Pusher('634bcc3a90137cfc5b38', {
      cluster: 'ap2',
      encrypted: true
    });

    var channel = pusher.subscribe('ride-request');

    channel.bind('ride-arrived', function(data) {
       if(data.driver_ids.indexOf(parseInt(params.id)) !== -1){
            var k = $('.waitingBox').length;
            $('#waitingBox').append("<div class='waitingBox box' id='waitBox"+k+"'>"+
                "<div class='row1'>"+
                    "<span>Req Id: <span id='reqIdWait"+k+"'>"+ data.request.request_id +"</span></span>"+
                    "<span>Cust Id: <span>"+ data.request.customer_id +"</span></span>"+
                "</div>"+
                "<div class='row2'>"+
                    "<span>"+ secondsTimeSpanToHMS(data.request.request_time_elapsed) +" ago</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<button class='select' data-requestId="+ data.request.request_id +">Select</button>"+
                "</div>"+
            "</div>");
        }
    });

    channel.bind('ride-already-assigned', function(data) {
       if(data.driver_ids.indexOf(parseInt(params.id)) !== -1){
            for(var i=0; i < $('.waitingBox').length; i++){
                if($('#reqIdWait'+i).html() == data.request.inc_id){
                    $('#waitBox'+i).remove();
                    var id = 0;
                    $('.waitingBox').each(function(){
                      if ($(this).attr('id') !== ("waitBox" + id)){
                        var request_id = $(this).attr('id').replace("waitBox", "reqIdWait")
                        $(this).attr("id", ("waitBox" + id));
                        $("#" + request_id).attr("id", ("reqIdWait" + id))
                      }
                      id = id + 1;
                    });
                    return false;
                }
            }
       }
    });

    channel.bind('ride-completed', function(data) {
        if(data.driver_ids.indexOf(parseInt(params.id)) !== -1){
            for(var i=0; i < $('.ongoing').length; i++){
                if($('#reqIdOn'+i).html() == data.request.request_id){
                    $('#onBox'+i).remove();
                    $('#completeBox').append("<div class='completed box'>"+
                        "<div class='row1'>"+
                            "<span>Req Id: <span>"+ data.request.request_id +"</span></span>"+
                            "<span>Cust Id: <span>"+ data.request.customer_id +"</span></span>"+
                        "</div>"+
                        "<div class='row2'>"+
                        "<span class='label'>Request:</span> <span>"+ secondsTimeSpanToHMS(data.request.request_time_elapsed) +" ago</span>"+
                        "</div>"+
                        "<div class='row3'>"+
                            "<span class='label'>Picked Up:</span> <span>"+ secondsTimeSpanToHMS(data.request.pickedup_time_elapsed) +" ago</span>"+
                        "</div>"+
                        "<div class='row3'>"+
                            "<span class='label'>Complete:</span> <span>"+ secondsTimeSpanToHMS(data.request.complete_time_elapsed) +" ago</span>"+
                        "</div>"+
                    "</div>");
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
                    "<span class='label'>Request:</span> <span>"+ secondsTimeSpanToHMS(v.request_time_elapsed) +" ago</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<span class='label'>Picked Up:</span> <span>"+ secondsTimeSpanToHMS(v.pickedup_time_elapsed) +" ago</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<span class='label'>Complete:</span> <span>"+ secondsTimeSpanToHMS(v.complete_time_elapsed) +" ago</span>"+
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
                    "<span>"+ secondsTimeSpanToHMS(v.request_time_elapsed) +" ago</span>"+
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
                    "<span class='label'>Request:</span> <span class='ongoing_formatted_request_time'>"+ secondsTimeSpanToHMS(v.request_time_elapsed) +" ago</span><span style='display: none' class='ongoing_request_time_in_seconds'>"+ v.request_time_elapsed +"</span>"+
                "</div>"+
                "<div class='row3'>"+
                    "<span class='label'>Picked Up:</span> <span class='ongoing_formatted_pickedup_time'>"+ secondsTimeSpanToHMS(v.pickedup_time_elapsed) +" ago</span><span style='display: none' class='ongoing_pickedup_time_in_seconds'>"+ v.pickedup_time_elapsed +"</span>"+
                "</div>"+
            "</div>");
                ongoing_count = ongoing_count + 1;
            }
        });
    }
}

function secondsTimeSpanToHMS(s) {
    var h = Math.floor(s/3600); //Get whole hours
    s -= h*3600;
    var m = Math.floor(s/60); //Get remaining minutes
    s -= m*60;
    return h+" hour "+(m < 10 ? '0'+m : m)+" min "+(s < 10 ? '0'+s : s)+ " sec"; //zero padding on minutes and seconds
}

setInterval(update_timer, 1000);

function update_timer(){

    seconds = parseInt($(".ongoing_request_time_in_seconds").html()) + 1
    $(".ongoing_request_time_in_seconds").html(seconds);
    $(".ongoing_formatted_request_time").html(secondsTimeSpanToHMS(seconds) + ' ago');

    seconds = parseInt($(".ongoing_pickedup_time_in_seconds").html()) + 1
    $(".ongoing_pickedup_time_in_seconds").html(seconds);
    $(".ongoing_formatted_pickedup_time").html(secondsTimeSpanToHMS(seconds) + ' ago');

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