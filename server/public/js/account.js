$(document).ready(function(){
    $.ajax({
        type: "GET",
        url: "/users/accountData",           
        beforeSend: function(){ //se muestra una imagen mientras el ajax se ejecuta
            showIsLoading("Procesando...");
        }
    }).done(function (data) {
        $('#email').html(data.username);
        $('#name').html(data.name);
        $('#lastName').html(data.lastName);
        $('#secondLastName').html(data.secondLastName);
        $('#phone').html(data.phone);

    }).always(function (data) {
        hideIsLoading();
    });
});