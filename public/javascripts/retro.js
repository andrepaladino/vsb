$(function () {
    console.log(detectMob())
    if(!detectMob()){
        var templateNumber = $('input[name=retroTemplateNumber]').val();
        $('#includedContent').load('/template_views/template_' + templateNumber + '.html');
    }

});

function detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}

var socket = io()

window.onbeforeunload = function (e) {
    // check condition
    var retroid = $('input[name=retroID]').val();
    var userid = $('input[name=user]').val();
    var disconect = { retroid, userid }
    socket.emit('leavePage', (disconect))
};

$(function () {
    var retroid = $('input[name=retroID]').val();
    var userid = $('input[name=user]').val();
    console.log('New user Name: ' + userid)
    socket.emit('newUser', retroid, userid)
})

$(function () {
    $(".message").draggable();
});

socket.on('onlineUser', function (userid) {
    var element = $('#' + userid).find('img')

    if (element.hasClass('offline')) {
        element.removeClass('offline')
    }

    if (!element.hasClass('online')) {
        element.addClass("online")
    }
})

socket.on('offlineUser', function (userid) {
    var element = $('#' + userid).find('img')

    if (element.hasClass('online')) {
        element.removeClass('online')
    }

    if (!element.hasClass('offline')) {
        element.addClass("offline")
    }
})

socket.on('receivedMessage', function (message) {
    renderMessage(message)
})

socket.on('previousMessages', function (messageObjects) {
    for (messageObject of messageObjects) {
        renderMessage(messageObject)
    }
})

socket.on('updatePosition', function (coord) {
    document.getElementById(coord.target).append(document.getElementById(coord.element))
    document.getElementById(coord.element).style.left = coord.left + "px"
    document.getElementById(coord.element).style.top = coord.top + "px"
})

socket.on('removeInput', function (input) {
    removeInput(input._id)

    var elementCount = parseInt($('#' + input.user + ' .inputQnt').html())

    if (elementCount > 0) {
        elementCount = elementCount - 1
        $('#' + input.user + ' .inputQnt').html(elementCount)
    }
})

socket.on('updateLikes', function (input) {
    console.log('Update Likes count for: ' + input._id)
    $('#' + input._id + ' .likesCount').html(input.likes.length)
})

function removeInput(inputid) {
    $("#" + inputid).remove()
}

function renderMessage(messageObject) {
    var appendTo = '.messages.' + messageObject.category.toLowerCase()
    $(appendTo.toString()).append(
        '<div id="' + messageObject._id + '" class="message ui-draggable ui-draggable-handle"><div><strong>'+ messageObject.user.username +'</strong></div><div><p class="message-text">' +messageObject.text +'</p></div><a class="remove-input" href="#"><span class="material-icons">delete forever</span></a><a class="like-input" href="#"><span class="material-icons">thumb_up_alt</span></a><span class="likesCount">0</span><input type="hidden" name="MessageID" value="5ebc624d7ab11810b82bf36c"></div>'
    )

    if (document.getElementById(messageObject._id)) {
        document.getElementById(messageObject._id).style.left = messageObject.positionLeft + "px"
        document.getElementById(messageObject._id).style.top = messageObject.positionTop + "px"
    }


    var elementCount = parseInt($('#' + messageObject.user._id + ' .inputQnt').html())
    elementCount = elementCount + 1
    $('#' + messageObject.user._id + ' .inputQnt').html(elementCount)
    console.log(elementCount)

    $(".message").draggable({
        containment: '#whiteboard',
        revert: 'invalid',
        stack: '.message',
        stop: function (event, ui) {
            var coord = { coordinates: $(this).position(), messageid: $(this).context.id, retroid: $('input[name=retroID]').val() };
            $("#left").val(coord.left);
            $("#top").val(coord.top);
            console.log(coord)
        }
    });

    $(".remove-input").off().on("click", function () {
        var r = confirm("Are you sure you want to remove this card?")
        if (r == true) {
            var inputid = $(this).context.parentElement.id
            var retroid = $('input[name=retroID]').val();
            var input = { inputid: inputid, retroid: retroid }
            socket.emit('deleteInput', input)
        }
    });

    $(".like-input").off().on("click", function () {
        var inputid = $(this).context.parentElement.id
        var retroid = $('input[name=retroID]').val();
        var userid = $('input[name=user]').val();
        console.log('Like user: ' + userid)
        var input = { inputid: inputid, retroid: retroid, userid: userid }
        socket.emit('likeInput', input)
    });


    $(function () {
        console.log("draggable")
        $(".messages").droppable({
            accept: ".message",
            classes: {
                "messages": "highlight"
            },
            drop: function (event, ui) {
                //Get the position before changing the DOM
                var p1 = ui.draggable.parent().offset();
                //Move to the new parent
                $(this).append(ui.draggable);
                //Get the postion after changing the DOM
                var p2 = ui.draggable.parent().offset();
                //Set the position relative to the change
                ui.draggable.css({
                    top: parseInt(ui.draggable.css('top')) + (p1.top - p2.top),
                    left: parseInt(ui.draggable.css('left')) + (p1.left - p2.left)
                });
                var offsetTop = ui.draggable.context.offsetTop
                var offsetLeft = ui.draggable.context.offsetLeft
                var move = { target: $(this).context.id, element: ui.draggable.context.id, top: offsetTop, left: offsetLeft, retroid: $('input[name=retroID]').val() }
                socket.emit('changePosition', move)
            }
        });
    })

}

socket.on('goToNext', function (data) {
    console.log(data.retroid)
    location.reload()
})

socket.on('goToCompletePage', function (data) {
    console.log(data.retroid)
    window.location.href = '/retro/complete/' + data.retroid
})


socket.on('createActionItem', function (data) {
    console.log(data.actionitem)
    console.log(data.owner)
    
    if(data.actionitem.status == 'OPEN'){
        $('#actionitems').append('<tr><td>' + data.actionitem.text + '</td><td>' + data.owner.username + '</td><td>' + data.actionitem.retrospective.name + '</td><td> <span style="color: orange" title="Open" class="material-icons">flag</span></td><td><div role="group" class="btn-group"><button type="button" data-toggle="dropdown" aria-haspopup="true"aria-expanded="false" class="material-icons">more_horiz</button><div aria-labelledby="btnGroupDrop1" class="dropdown-menu"><a id="completeAction" href="#"action-id=" '+ data.actionitem._id+'" class="dropdown-item">Complete</a><a id="cancelAction" href="#"action-id="'+ data.actionitem._id + '" class="dropdown-item">Cancel</a></div></div></td></tr>')
    }else{
        location.reload()
    }

})

socket.on('completedActionItem', function (data) {
    location.reload()
})

socket.on('facilitatorChanged', function (data) {
    location.reload()
})

socket.on('UpdateTimer', function (data) {
    $('#timerMin').html(data.min)
    $('#timerSec').html(data.sec)

    if(data.min == '00' && data.sec == '00'){
        document.getElementById("timerMin").style.color = 'red';
        document.getElementById("timerSec").style.color = 'red';
        document.getElementById("clock").style.color = 'red';
    }


})

socket.on('TimeisUp', function (data) {
    alert('Time is up')
    document.getElementById("timerMin").style.color = 'black';
    document.getElementById("timerSec").style.color = 'black';
    document.getElementById("clock").style.color = 'black';
    $('#timerMin').html('15')
    $('#timerSec').html('00')
})



$('.nextstep').on('click', function (e) {
    console.log('Click Next Step')
    var retroid = $('input[name=retroID]').val();
    $.ajax({
        type: 'GET',
        url: '/retro/live/next/' + retroid,
        success: function (response) {
            location.reload()
            socket.emit('nextStep', retroid)
            socket.emit('StopCountDown', retroid)
        },
        error: function (err) {
            console.log(err);
        }
    });
})

$('.previousstep').on('click', function (e) {
    var retroid = $('input[name=retroID]').val();
    $.ajax({
        type: 'GET',
        url: '/retro/live/previous/' + retroid,
        success: function (response) {
            location.reload()
            socket.emit('nextStep', retroid)
            socket.emit('StopCountDown', retroid)
        },
        error: function (err) {
            console.log(err);
        }
    });
})

$('.completeRetro').on('click', function (e) {
    socket.emit('StopCountDown', retroid)
    var r = confirm("Are you sure you want to finish this meeting?")
    var retroid = $('input[name=retroID]').val();

    if (r == true) {
        console.log('Complete Retrospective')
        $.ajax({
            type: 'POST',
            url: '/retro/live/complete/' + retroid,
            success: function (response) {
                socket.emit('completedRetro', retroid)
                window.location.href = '/retro/complete/' + retroid
            },
            error: function (err) {
                console.log(err);
            }
        });

    }
})


$('#chat').submit(function (event) {
    event.preventDefault();
    var user = $('input[name=user]').val();
    console.log(user)
    var message = $('input[name=message]').val();
    var retroid = $('input[name=retroID]').val();
    var category = $("#inputCategory").val();
    if (user.length && message.length) {
        var messageObject = {
            user: user,
            text: message,
            retroid: retroid,
            category: category
        };
        socket.emit('sendMessage', messageObject);
    }

    $('input[name=message]').val('')

})


$('#actionitem').submit(function (event) {
    event.preventDefault();

    var text = $('input[name=actionitem]').val();
    var owner = $('select[name=selectMember]').val();
    console.log('AI owner: ' + owner)
    var retroid = $('input[name=retroID]').val();

    if (text.length && owner.length) {
        var actionItem = {
            owner: owner,
            text: text,
            retroid: retroid
        };
        socket.emit('createAction', actionItem);
        $('input[name=actionitem]').val('')
    }
})

$(document).ready(function () {
    $('.cancelAction').on('click', function (e) {
        $target = $(e.target);

        const actionid = $target.attr('action-id');
        var retroid = $('input[name=retroID]').val();
        

        var action = { actionid: actionid, retroid: retroid }

        $.ajax({
            type: 'GET',
            url: '/action/cancel/' + actionid,
            success: function (response) {
                socket.emit('completeActionItem', action)
                location.reload()
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});

$(document).ready(function () {
    $('.completeAction').on('click', function (e) {
        $target = $(e.target);

        const actionid = $target.attr('action-id');
        var retroid = $('input[name=retroID]').val();


        var action = { actionid: actionid, retroid: retroid }

        $.ajax({
            type: 'GET',
            url: '/action/complete/' + actionid,
            success: function (response) {
                socket.emit('completeActionItem', action)
                location.reload()
            },
            error: function (err) {
                console.log(err);
            }
        });

    });
});

$(document).ready(function () {
    $('.changeFacilitator').on('click', function (e) {
        $target = $(e.target);

        const userid = $target.attr('user-id');
        var retroid = $('input[name=retroID]').val();

        console.log('Change facilitator: ')
        console.log('new facilitator: ' + userid)
        console.log('retro: ' + retroid)

        $.ajax({
            type: 'GET',
            url: '/retro/changefacilitator/' + retroid + '/' + userid,
            success: function (response) {
                socket.emit('changeFacilitator', retroid)
                location.reload()
            },
            error: function (err) {
                console.log(err);
            }
        });

    });
});


$(document).ready(function () {
    $('.startCountDown').on('click', function (e) {

        console.log('Count Down')
        var minutes = parseInt(($('#timerMin').html())) * 60
        var sec = minutes + parseInt($('#timerSec').html())

        if (isNaN(sec) || sec <= 0) {
            console.log('Not a Number')

            $('#timerMin').html('15')
            $('#timerSec').html('00')
        } else {
            var retroid = $('input[name=retroID]').val();

            socket.emit('StartCountDown', { sec: sec, retroid: retroid })
        }


    });
});

$(document).ready(function () {
    $('.stopCountDown').on('click', function (e) {
        var retroid = $('input[name=retroID]').val();
        socket.emit('StopCountDown', retroid)

    });
});

$(document).ready(function () {
    $('#timerMin').on('keyup', function (e) {
        console.log($(this).html())
        var min = $(this).html()
        if(isNaN(min)){
            console.log('Not a number')
            $(this).html('15')
        }

        if(min.length > 2){
            $(this).html('15')
        }
    });

    $('#timerSec').on('keyup', function (e) {
        console.log($(this).html())
        var sec = $(this).html()
        if(isNaN(sec)){
            console.log('Not a number')
            $(this).html('00')
        }

        if(sec.length > 2){
            $(this).html('00')
        }
    });
});





