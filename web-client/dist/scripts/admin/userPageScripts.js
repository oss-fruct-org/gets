$(document).ready(function() { 

    var table = $('table');

    $(".dropdown-menu-item").on("click",function(e) { 

        var rights = $(this).text(); 
        var id = $(this).parent().parent().attr("id");

        $.post("./actions/addAdminUser.php",{"rights": rights, "id": id}, function(data) { 
           location.reload();
        });

    });
   
    $(".btn-danger").on("click",function(e) { 

        var id = $(this).attr("id");

        $.post("./actions/deleteUser.php",{"id": id}, function(data) { 

            $(this).parent().parent().fadeOut(); 
        });

    });

    $("tr").find("td:eq(0), td:eq(1), td:eq(2)").on("click",function(e) {

        var user_id = $(this).parent().attr("id");

        var form = jQuery('<form>', {
            'action': './admint.php',
            'method' : 'POST'
        }).append(jQuery('<input>', {
            'name': 'user_id',
            'value': user_id,
            'type': 'hidden'
        }));
        form.appendTo("body").submit();
    });

    $(".users-sort").on("click",function(e) {   

        $(".users-sort").each(function(index) 
        {
            $(this).parent().removeClass("active");             
        })  
       
        $(this).parent().addClass("active");

        if($(this).text().indexOf('Admin') >= 0) {

            $("table tr").each(function(index)
            {
                if(countUsers == currentIndex)
                    return;

                var rightCol = $(this).find(".btn");

                if (rightCol.text().indexOf('Admin') >= 0) {

                        $(this).fadeIn()
                    } else {
                        $(this).fadeOut();
                    }                            
            })  
            $("#seeMoreRecords").fadeOut();
            return;
        }

        if($(this).text().indexOf('Trusted') >= 0) {

            $("table tr").each(function(index) 
            {
                if(countUsers == currentIndex)
                    return;

                var rightCol = $(this).find(".btn");

                if(rightCol.text().indexOf('Admin') >= 0 || 
                    rightCol.text().indexOf('Trusted') >= 0) { 
                    
                        $(this).fadeIn() 
                    } else {
                        $(this).fadeOut();
                    }
            })  
            $("#seeMoreRecords").fadeOut();
            return;
        }

         $("table tr").each(function(index) {
            $(this).fadeOut();
        }) 
        // так как пробегаемся еще и по заголовку
        var countUsers = -1;

        $("table tr").each(function(index) 
        {
            if(countUsers == currentIndex)   
                return;
        
            $(this).fadeIn(); 
            countUsers++;
        }) 
        $("#seeMoreRecords").fadeIn(); 
    });

    $("#search").on("keyup", function() {
        var value = $(this).val();   
        $("tr").each(function(index) {
            if(value == ""){
                $(this).show();
            }else{
                $(this).hide();
            }
        })     
        $("td").each(function(index) {
            if (index != 0) {

                $row = $(this).text();                     

                if ($row.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    $(this).parent().show();
                }                            
            }
        })   
    }); 
});