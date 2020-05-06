$(function () {
    var templateNumber = $('input[name=retroTemplateNumber]').val();
    $('#includedContent').load('/template_views/template_' + templateNumber + '.html');
});

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
    var element = $('#' + userid).children(":first")

    if (element.hasClass('offline')) {
        element.removeClass('offline')
    }

    if (!element.hasClass('online')) {
        $('#' + userid).children(":first").addClass("online")
    }
})

socket.on('offlineUser', function (userid) {
    var element = $('#' + userid).children(":first")

    if (element.hasClass('online')) {
        element.removeClass('online')
    }

    if (!element.hasClass('offline')) {
        $('#' + userid).children(":first").addClass("offline")
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
        '<div id="' + messageObject._id + '" class="message"><strong>' + messageObject.user.username + '</strong>: ' + messageObject.text + '</br><a class="remove-input" href="#"><span class="material-icons">delete forever</span></a> <a class="like-input" href="#"><span class="material-icons">thumb_up_alt</span></a><span class="likesCount">' + messageObject.likes.length + '</span> <input type="hidden" name="MessageID" value="' + messageObject._id + '"></input> </div>'
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


socket.on('createActionItem', function (data) {
    console.log(data.actionitem)
    console.log(data.owner)
    $('#actionitems').append('<tr><th>'+data.actionitem.text+'</th><th>'+data.owner.username+'</th><th>' +data.actionitem.retrospective.name+ '</th><th>'+data.actionitem.status+'</th><th><a href="" class="btn btn-info"><span action-id = ' + data.actionitem._id + ' class="material-icons">done_outline</span></a></th><th>   <a href="" class="btn btn-danger delete-action"><span action-id = ' + data.actionitem._id + ' class="material-icons">clear</span></a></th>')
})

socket.on('cancelledActionItem', function (data) {

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
        },
        error: function (err) {
            console.log(err);
        }
    });
})

$('.completeRetro').on('click', function (e) {
    var r = confirm("Are you sure you want to finish this meeting?")
    var retroid = $('input[name=retroID]').val();

    if (r == true) {
        console.log('Complete Retrospective')
        $.ajax({
            type: 'POST',
            url: '/retro/live/complete/' + retroid,
            success: function (response) {
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
    }
})

$(document).ready(function () {
    $('.cancel-action').on('click', function (e) {
        $target = $(e.target);

        const actionid = $target.attr('action-id');
        console.log('Remove Action Item: ' + actionid)

        socket.emit('cancelActionItem', actionid)
    });
});

$(document).ready(function () {
    $('.complete-action').on('click', function (e) {
        $target = $(e.target);

        const actionid = $target.attr('action-id');
        console.log('Complete Action Item: ' + actionid)

        socket.emit('completeActionItem', actionid)
    });
});



