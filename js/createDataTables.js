﻿
function makeSelectorsFromCols(colNames, ulColID, ulXID, ulYID, radioSelector) {
    $('#ulcols *').remove();

    colNames.forEach(function (colName) {
        var elem = '<li>' + colName + "<a></a></li>";
        //var elem = '<li class="liCols>' + colName + "</li>";
        $('#ulcols').append(elem)
       // console.log($(elem))

    })
    $(document).on("click", "a.remove", function () {
        $(this).parent().remove();
    });

    $(document).on("click", "#ulcols li", function () {
        var elem = '<li>' + $(this).text() + "<a href='javascript: void(0); ' class='remove'>&times;</a></li>";
        if ($("input[name='optradio']:checked").val().includes("X")) {
            if ($('#ulXvals *').length < 1) {
                $('#ulXvals').append(elem)
            } else {
                if (!$('#ulXvals').html().includes(elem)) {
                    console.log("false")
                    $('#ulXvals').append(elem)
                }
            }

            
        } else {
            //console.log($("input[name='optradio']:checked").val())
            //$('#ulYvals').append(elem)
            if (!$('#ulXvals').html().includes(elem)) {
                $('#ulYvals').append(elem)
            }
        }
        
    });

}



//AsyncTableLoad().done(makeSelectorsFromCols());




function buildEmptyHtmlTable(preExistingContainerID, outputTableID, outputTableClass, colnames) {
    //clearout any old table
    $("#" + preExistingContainerID + ' *').remove();
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
function sizeQueryResultTable(containerID) {
    $('#' + containerID).css("max-height", $($('#tableChildContainer').css("max-height")))
}

//remember to redraw if orginial tbl changes
function buildSecondTableFromQuery(tblqryID, tblresID, qrystr) {
    //get the data in html table from DataTable Api rather than alasql, which will only get data contained on the first pg
    var data = $('#' + tblqryID).DataTable().data().toArray();

    sizeQueryResultTable('tableChildContainer');

    alasql(qrystr, [data], function (data) {
        var cnames = Object.keys(data[0])
        var dtcolumns = [];
        cnames.forEach(colVar => dtcolumns.push({ "data": colVar }))
        buildEmptyHtmlTable("tableChildContainer", tblresID, "table table-responsive table-hover table-sm compact", cnames)
        $('#' + tblresID).DataTable({
            buttons: [
                'copy', 'excel', 'pdf'
            ],
            "iDisplayLength": 10,
            "dom": 'flrtip',
            "drawCallback": function (settings) {
                var api = this.api();
                if (api.rows().data().toArray().length > 20) {
                    // drawBarChart(api.rows().data().toArray());//usethis to get full data set
                    //THE FUNCTION DRAW drawBarChart can be found in js/barchartFromArryOfObjects

                    //drawback functions here can be used to update/redraw charts based on tbale data
                    if ($('#ulXvals *').length > 0 && $('#ulYvals *').length > 0) {
                        if (drawbackFunc1 != null) {
                            drawbackFunc1(api.rows({ page: 'current' }).data().toArray());
                        }
                    }

                    if (drawbackFunc2 != null) {
                        drawbackFunc2(api.rows({ page: 'current' }).data().toArray());
                    }
                }
                // makeSelectorsFromCols(cnames, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
            },
            data: data,
            columns: dtcolumns,
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
                makeSelectorsFromCols(cnames, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
            }
             
        })
    }) 



}

function clientFileToDataTable(event, drawbackFunc1 = null, drawbackFunc2 = null) {
    alasql('SELECT * FROM FILE(?,{headers:true})', [event], function (data) {
       
        //// Process data here
        //console.log(Object.keys(data[0]))
        //var cnames = Object.keys(data[0])
        //var dtcolumns = [];
        //cnames.forEach(colVar => dtcolumns.push({ "data": colVar }))
        ////buildEmptyHtmlTable("tableChildContainer", "queryTable", "table table-responsive table-hover", cnames)
        //buildEmptyHtmlTable("tableContainer", "tblDynamic", "table table-responsive table-hover table-sm compact", cnames)
        ////alasql('SELECT * INTO HTML("#queryTable", {headers:true}) FROM ?', [data])
        //$('#tblDynamic').DataTable({
        //    buttons: [
        //        'copy', 'excel', 'pdf'
        //    ],
        //    "iDisplayLength": 10,
        //    "dom": 'flrtip',
        //    data:data,
        //    columns: dtcolumns,
        //    initComplete: function() {
        //        this.api().columns().every(function () {
        //            var column = this;
        //            if (column.data().unique().length < 50) {
        //                var select = $('<select><option value=""></option></select>')
        //                    .appendTo($(column.footer()).empty())
        //                    .on('change', function () {
        //                        var val = $.fn.dataTable.util.escapeRegex(
        //                            $(this).val()
        //                        );

        //                        column
        //                            .search(val ? '^' + val + '$' : '', true, false)
        //                            .draw();
        //                    });

        //                column.data().unique().sort().each(function (d, j) {
        //                    select.append('<option value="' + d + '">' + d + '</option>')
        //                });
                        



        //            } else {
        //                //var title = $(this).text();

        //                var input = $('<input type = "text" placeholder = "Search ' + column.name + '"></input>')
        //                    .appendTo($(column.footer()).empty())
        //                    .on('keyup change', function () {
        //                        if (column.search() !== this.value) {
        //                            column
        //                                .search(this.value)
        //                                .draw();
        //                        }
        //                    });
        //                input;
        //            }

        //        });
        //    }
        //})
           
        var cnames = Object.keys(data[0])
        var dtcolumns = [];
        cnames.forEach(colVar => dtcolumns.push({ "data": colVar }))
        //buildEmptyHtmlTable("tableChildContainer", "queryTable", "table table-responsive table-hover", cnames)
        buildEmptyHtmlTable("tableContainer", "tblDynamic", "table table-responsive table-hover table-sm compact", cnames)
        //alasql('SELECT * INTO HTML("#queryTable", {headers:true}) FROM ?', [data])
        $('#tblDynamic').DataTable({
            //buttons: [
            //    'copy', 'excel', 'pdf'
            //],
            "iDisplayLength": 10,
            "dom": 'flrtip',
            data: data,
            columns: dtcolumns,
            "drawCallback": function (settings) {
                var api = this.api();
                if (api.rows().data().toArray().length > 20) {
                    // drawBarChart(api.rows().data().toArray());//usethis to get full data set
                    //THE FUNCTION DRAW drawBarChart can be found in js/barchartFromArryOfObjects

                    //drawback functions here can be used to update/redraw charts based on tbale data
                    if ($('#ulXvals *').length > 0 && $('#ulYvals *').length > 0) {
                        if (drawbackFunc1 != null) {
                            drawbackFunc1(api.rows({ page: 'current' }).data().toArray());
                        }
                    }

                    if (drawbackFunc2 != null) {
                        drawbackFunc2(api.rows({ page: 'current' }).data().toArray());
                    }
                }
                // makeSelectorsFromCols(cnames, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
            },
            initComplete: function () {
                this.api().columns().every(function () {
                    var column = this;
                    //console.log(column)
                    //console.log(column.name)


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
                makeSelectorsFromCols(cnames, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
            }

        })
       // console.log(data[0].keys())
        //console.log(data.toArray())

        //var table =  
    });
    
}

function loadServerFile(filepath, drawbackFunc1 = null, drawbackFunc2 = null) {
    alasql('SELECT * FROM CSV(?,{headers:true})', [filepath], function (data) {
      
        // Process data here
        //console.log(Object.keys(data[0]))
        var cnames = Object.keys(data[0])
        var dtcolumns = [];
        cnames.forEach(colVar => dtcolumns.push({ "data": colVar }))
        //buildEmptyHtmlTable("tableChildContainer", "queryTable", "table table-responsive table-hover", cnames)
        buildEmptyHtmlTable("tableContainer", "tblDynamic", "table table-responsive table-hover table-sm compact", cnames)
        //alasql('SELECT * INTO HTML("#queryTable", {headers:true}) FROM ?', [data])
        $('#tblDynamic').DataTable({
            //buttons: [
            //    'copy', 'excel', 'pdf'
            //],
            "iDisplayLength": 10,
            "dom": 'flrtip',
            data: data,
            columns: dtcolumns,
            "drawCallback": function (settings) {
                var api = this.api();
                if (api.rows().data().toArray().length > 20) {
                    // drawBarChart(api.rows().data().toArray());//usethis to get full data set
                    //THE FUNCTION DRAW drawBarChart can be found in js/barchartFromArryOfObjects

                    //drawback functions here can be used to update/redraw charts based on tbale data
                    if ($('#ulXvals *').length > 0 && $('#ulYvals *').length > 0) {
                        if (drawbackFunc1 != null) {
                            drawbackFunc1(api.rows({ page: 'current' }).data().toArray());
                        }
                    }
                    
                    if (drawbackFunc2 != null) {
                        drawbackFunc2(api.rows({ page: 'current' }).data().toArray());
                    }
                }
               // makeSelectorsFromCols(cnames, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
            },
            initComplete: function () {
                this.api().columns().every(function () {
                    var column = this;
                    //console.log(column)
                    //console.log(column.name)
                    

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
                makeSelectorsFromCols(cnames, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
            }
            
        })
        

        // console.log(data[0].keys())
        //console.log(data.toArray())

        //var table =  
    });
    //return true;
}



function ajaxWebServiceDataTable(contanerID, tableID, varNames, drawbackFunc1 = null, drawbackFunc2 = null) {
    //var table = buildEmptyHtmlTable("tableContainer",
    //    "tblDynamic",
    //    "table table-responsive table-hover", varNames[2]
    //)
    var table = buildEmptyHtmlTable(contanerID,
        tableID,
        "table table-responsive table-hover table-sm compact", varNames[2]
    )
        .DataTable({
            //buttons: [
            //    'copy', 'excel', 'pdf'
            //],
            "autoWidth": false,
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