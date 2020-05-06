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
        console.log('member-id: ' + memberId)

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

$(document).ready(function () {
    $("#searchAction").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTable tr").filter(function () {
            $(this).toggle($(this).children(':eq(0)').text().toLowerCase().indexOf(value) > -1)
        });
    });

    $("#searchActionOwner").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTable tr").filter(function () {
            $(this).toggle($(this).children(':eq(1)').text().toLowerCase().indexOf(value) > -1)
        });
    });
});

$(document).ready(function () {
    $("#filterStatus").on('click', function () {
        var status = $('#StatusOptions').val();
        if (status === 'ALL') {
            $("#myTable tr").show()
        } else {
            $("#myTable tr").filter(function () {
                $(this).toggle($(this).children(':eq(4)').text().indexOf(status) > -1)
            });
        }
    })
})



