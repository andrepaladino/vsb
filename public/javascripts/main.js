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

        var r = confirm("Are you sure you want to remove this member?")

        if(r == true){
            $.ajax({
                type: 'POST',
                url: '/teams/remove/member/' + teamId,
                data: { 'memberId': memberId },
                success: function (response) {
                    window.location.href = '/teams/details/' + teamId;
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }

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
                $(this).toggle($(this).children(':eq(3)').find('input[name=actionStatus]').val().indexOf(status) > -1)
            });
        }
    })
})

$(document).ready(function () {
    $('.option-card').click(function () {
        $(".choice").removeClass("choice");
        $(this).addClass("choice");
        console.log($(this).find("input").val()); 

        $('#selectedNumber').val($(this).find("input").val())
        
        document.getElementById("newRetro").style.display = "block";
    });
})


$(document).ready(function () {
    $('#show-more').click(function () {
        var x = document.getElementById("more-info");
        if (x.style.display === "none") {
          x.style.display = "block";
          $(this).html('Show less')
        } else {
          x.style.display = "none";
          $(this).html('Show more')
        }
    });
})





