
//////////funciones generales
	$( ".error_dialog" ).dialog({
		autoOpen: false,
		dialogClass: 'ui-dialog-red',
		show: {
			effect: "blind",
			duration: 500
		},
		hide: {
			effect: "explode",
			duration: 500
		}
	});

	$( ".warning_dialog" ).dialog({ //Listener que muestra los popUp de advertencia
		autoOpen: false,
		dialogClass: 'ui-dialog-yellow',
		show: {
			effect: "blind",
			duration: 500
		},
		hide: {
			effect: "explode",
			duration: 500
		}
	});

	$( ".correct_dialog" ).dialog({ //Listener que muestra los popUp de Correcto
		autoOpen: false,
		dialogClass: 'ui-dialog-green',
		show: {
			effect: "blind",
			duration: 500
		},
		hide: {
			effect: "explode",
			duration: 500
		}
	});

	$(".confirm_dialog" ).dialog({ //muestra un dialog de confirmacion
		dialogClass: 'ui-dialog-yellow bringToFront',
		autoOpen: false,
		resizable: false,
		height: 'auto',
		modal: true,
		buttons: [
			{
				'class' : 'btn',
				"text" : "Cancelar",
				'id' : 'pp_confirm_cancel_btn',
				click: function() {
					$(this).dialog( "close" );
				}
			},
			{
				'class' : 'btn blue',
				"text" : "Aceptar",
				'id' : 'pp_confirm_accept_btn',
				click: function() {
					$(this).dialog( "close" );
				}
			}
		]
	});


	function showIsLoading(textToShow) {
		if (!$(".isloading-overlay")[0]) {
			$.isLoading({ text: textToShow });
		} else {
			$("#loading-div > p").html(textToShow);
		}
	}

	function hideIsLoading() {
		if ($(".isloading-overlay")[0]) {
			$.isLoading("hide");
		}
	}
	function fnOpenErrorDialog(msn) {
		$("#error_message").html(msn); // coloca el mensaje recibido
		$(".error_dialog").dialog("open"); //abre el dialogo con el mensaje
	}

	function fnOpenSusessDialog(msn) {
		$("#correct_dialog").html(msn); // coloca el mensaje recibido
		$(".correct_dialog").dialog("open"); //abre el dialogo con el mensaje
	}
