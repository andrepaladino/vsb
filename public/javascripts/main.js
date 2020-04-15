$(document).ready(function () {
    $('.delete-team').on('click', function (e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        console.log('dentro do script' + id)

        $.ajax({
            type: 'DELETE',
            url: '/teams/delete/' + id,
            success: function (response) {
                alert('Team Deleted');
                window.location.href = '/teams';
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});

$(document).ready(function () {
    $('.remove-member').on('click', function (e) {
        $target = $(e.target);
        console.log(e.target)
        const teamId = $target.attr('team-id');
        const memberId = $target.attr('member-id');
        console.log('member-id: ' +memberId)

        $.ajax({
            type: 'POST',
            url: '/teams/remove/member/' + teamId,
            data: { 'memberId': memberId },
            success: function (response) {
                alert('Member removed');
                window.location.href = '/teams/details/' + teamId;
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});





