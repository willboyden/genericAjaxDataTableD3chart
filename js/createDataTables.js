function buildEmptyHtmlTable(preExistingContainerID, outputTableID, outputTableClass, colnames) {
    //clearout any old table
    $("#" + preExistingContainerID + ' table').remove();
    var strHtmlTable = '<table id="' + outputTableID + '"' + 'class= "' + outputTableClass + '">';
    strHtmlTable += '<thead><tr>';
    colnames.forEach(function (x) {
        strHtmlTable += '<th>'
        strHtmlTable += x
        strHtmlTable += '</th>'
    })
    strHtmlTable += "</tr></thead>";

    strHtmlTable += '<tfoot><tr>';
    colnames.forEach(function (x) {
        strHtmlTable += '<th>'
        strHtmlTable += x
        strHtmlTable += '</th>'
    })
    strHtmlTable += "</tr></tfoot>";
    strHtmlTable += "<table>";
    $("#" + preExistingContainerID).html(strHtmlTable);
    return $('#' + outputTableID)
}


function ajaxWebServiceDataTable(varNames, drawbackFunc1 = null, drawbackFunc2 = null) {
    var table = buildEmptyHtmlTable("tableContainer",
        "tblDynamic",
        "table table-responsive table-hover", varNames[2]
    )
        .DataTable({
            "iDisplayLength": 10,
            "dom": 'flrtip',
            "drawCallback": function (settings) {
                var api = this.api();
                if (api.rows().data().toArray().length > 20) {
                    // drawBarChart(api.rows().data().toArray());//usethis to get full data set
                    //THE FUNCTION DRAW drawBarChart can be found in js/barchartFromArryOfObjects

                    //drawback functions here can be used to update/redraw charts based on tbale data
                    if (drawbackFunc1 != null) {
                        drawbackFunc1(api.rows({ page: 'current' }).data().toArray());
                    }
                    if (drawbackFunc2 != null) {
                        drawbackFunc2(api.rows({ page: 'current' }).data().toArray());
                    }
                }
            },

            ajax: {
                type: "POST",
                //contentType: "application/json; charset=utf-8",
                url: 'dataService.asmx/getData',
                data: { cols: varNames[2].toString(), table: varNames[4] },
                dataSrc: function (json) {
                    console.log(json)
                    return JSON.parse(json)
                }
            },
            columns:
                varNames[3],//  scrollY: 400,//  deferRender:    true,//  scroller: {loadingIndicator: true}
            initComplete: function () {
                this.api().columns().every(function () {
                    var column = this;
                    if (column.data().unique().length < 50) {
                        var select = $('<select><option value=""></option></select>')
                            .appendTo($(column.footer()).empty())
                            .on('change', function () {
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );

                                column
                                    .search(val ? '^' + val + '$' : '', true, false)
                                    .draw();
                            });

                        column.data().unique().sort().each(function (d, j) {
                            select.append('<option value="' + d + '">' + d + '</option>')
                        });
                    } else {
                        //var title = $(this).text();

                        var input = $('<input type = "text" placeholder = "Search colName"></input>')
                            .appendTo($(column.footer()).empty())
                            .on('keyup change', function () {
                                if (column.search() !== this.value) {
                                    column
                                        .search(this.value)
                                        .draw();
                                }
                            });
                        input;
                    }
                    
                });
            }

        });
    return table;
}