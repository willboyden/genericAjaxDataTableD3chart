function makeBoxplot() {
    var data = [];
    $('#ulXvals li').each(function (a) {
        var tx = $(this).clone()
            .children()
            .remove()
            .end()
            .text();
        
        //$('#tblDynamic').DataTable().settings()[0].aoColumns.forEach(function (x) {
        //    if (x.sTitle === tx) {
        //        var ydat = $('#tblDynamic').DataTable().columns(x.idx).data().toArray();
        //        console.log(x.sTitle.toString())
        //        var trace1 = {
        //            //y:ydat,
        //            name: tx,
        //            type: 'box',
        //            name: 'All Points',
        //            jitter: 0.3,
        //            pointpos: -1.8,
        //            marker: {
        //                color: 'rgb(7,40,89)'
        //            },
        //            boxpoints: 'all'
        //        };
        //        data.push(trace1)
        //    }
        //})
        $('#tblDynamic').DataTable().settings()[0].aoColumns.forEach(function (x) {
            if (x.sTitle === tx) {
                $('#tblDynamic').DataTable().column(x.idx).data().unique().toArray().forEach(function (b) {
                    //var ydat = $('#tblDynamic').DataTable().columns(x.idx).data().toArray();
                    //console.log(["b", b])
                    
                    var trace1 = {
                        //y:ydat,
                        name: b,
                        type: 'box',
                        name: 'All Points',
                        jitter: 0.3,
                        pointpos: -1.8,
                        marker: {
                            color: 'rgb(7,40,89)'
                        },
                        boxpoints: 'all'
                    };
                    data.push(trace1)
                })
                
                console.log(x.sTitle.toString())
                
            }
        })


    })

    $('#ulYvals li').each(function (a) {
        var tx = $(this).clone()
            .children()
            .remove()
            .end()
            .text();

        $('#tblDynamic').DataTable().settings()[0].aoColumns.forEach(function (x) {
            if (x.sTitle == tx) {
                var ydat = $('#tblDynamic').DataTable().columns(x.idx).data().toArray().forEach(function (b) {
                    var table = $('#tblDynamic').DataTable();

                    var filteredData = table
                        .column(x.idx)
                        .data()
                        .filter(function (value, index) {
                            return value == b ? true : false;
                        });

                    data.map(function (b) {
                        b.y = ydat[0];
                        //b.name = tx
                        return b
                    })

                })

            }
        })


    })

    Plotly.newPlot('divPlotlyContainer', data);
}