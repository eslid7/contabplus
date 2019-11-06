
function initDashboardDaterange() {
    $('#dashboard-report-range').daterangepicker({
        ranges: {
            'Hoy': ['today', 'today'],
            'Hayer': ['yesterday', 'yesterday'],
            'Ultimos 7 diías': [Date.today().add({
                    days: -6
                }), 'today'],
            'Ultimos 30 dias': [Date.today().add({
                    days: -29
                }), 'today'],
            'Mes actual': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
            'Mes anterior': [Date.today().moveToFirstDayOfMonth().add({
                    months: -1
                }), Date.today().moveToFirstDayOfMonth().add({
                    days: -1
                })]
        },
        opens: (false ? 'right' : 'left'),
        format: 'MM/dd/yyyy',
        separator: ' to ',
        startDate: Date.today().add({
            days: -29
        }),
        endDate: Date.today(),
        minDate: '01/01/2012',
        maxDate: Date.today(),
        locale: {
            applyLabel: 'Enviar',
            fromLabel: 'Desde',
            toLabel: 'Hasta',
            customRangeLabel: 'Rango',
            daysOfWeek: ['Do', 'Lu', 'Ma', 'Mie', 'Ju', 'Vi', 'Sa'],
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            firstDay: 1
        },
        showWeekNumbers: true,
        buttonClasses: ['btn-danger']
    },

    function (start, end) {
        $('#form_date_range_from').val(start.toString('dd/MM/yyyy'));
        $('#form_date_range_to').val(end.toString('dd/MM/yyyy'));
        $('#dashboard-report-range span').html(start.toString('MMMM d, yyyy') + ' - ' + end.toString('MMMM d, yyyy'));
        initDashboard();
        getCalculateBillsByClient();
    });

    $('#dashboard-report-range').show();

    $('#dashboard-report-range span').html(Date.today().add({
        days: -29
    }).toString('MMMM d, yyyy') + ' - ' + Date.today().toString('MMMM d, yyyy'));
    $('#form_date_range_from').val(Date.today().add({days: -29}).toString('dd/MM/yyyy'));
	$('#form_date_range_to').val(Date.today().toString('dd/MM/yyyy'));
}

function initDashboard(){
    $.ajax({
        type: "GET",
        url: "/users/getCalculateBills",
        data: $('#form_data').serialize(),
        beforeSend: function(){ //se muestra una imagen mientras el ajax se ejecuta
            showIsLoading("Procesando...");
        }
    }).done(function (data) {
        $('#quantityBills').html(data.quantityBills);
        $('#totalTaxes').html(numberFormat(data.totalTaxes));
        $('#totalBills').html(numberFormat(data.totalBills));
    }).fail(function (data) {
        hideIsLoading();
        fnOpenErrorDialog(data.responseJSON.message);
    }).always(function (data) {
        hideIsLoading();
    });
}

function numberFormat(theNumber){
    newNumber = theNumber.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return newNumber;
};
jQuery(document).ready(function() {
    initDashboardDaterange();
    initDashboard();
})

function initCharts(data){
    $.plot($("#pie_chart_1"), data, {
       series: {
           pie: {
               show: true
           }
       },
       legend: {
           show: false
       }
   });
}

function getCalculateBillsByClient(){
    $.ajax({
        type: "GET",
        url: "/users/getCalculateBillsByClient",
        data: $('#form_data').serialize(),
        beforeSend: function(){ //se muestra una imagen mientras el ajax se ejecuta
            showIsLoading("Procesando...");
        }
    }).done(function (data) {
        console.log(data.arrayIssuing)
        initCharts(data.arrayIssuing);
    }).fail(function (data) {
        hideIsLoading();
        fnOpenErrorDialog(data.responseJSON.message);
    }).always(function (data) {
        hideIsLoading();
    });
}