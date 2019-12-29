function makeGroupedBarChart(data, xcol, keys, d3SelectedSVG) {
    //var svg = d3.select("svg"),


    let bounds = d3SelectedSVG.node().getBoundingClientRect();
    // let bounds = d3.select("body svg").node().getBoundingClientRect();
    let margin = {
        top: 15,
        right: 35, // leave space for y-axis
        bottom: 30, // leave space for x-axis
        left: 80
    };

    let w = parseInt(d3SelectedSVG.style("width"));
    let h = parseInt(d3SelectedSVG.style("height"));
    //console.log(["w", w])
    let plotWidth = w - margin.right - margin.left;
    let plotHeight = h - margin.top - margin.bottom;

    var svg = d3SelectedSVG,
        //margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = plotWidth,
        height = plotHeight,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //var svg = d3SelectedSVG,
    //    margin = { top: 20, right: 20, bottom: 30, left: 40 },
    //    width = +svg.attr("width") - margin.left - margin.right,
    //    height = +svg.attr("height") - margin.top - margin.bottom,
    //    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // The scale spacing the groups:
    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    // The scale for spacing each group's bar:
    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    //console.log(keys);
    x0.domain(data.map(function (d) { return d[xcol]; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })]).nice();
    let xAxis = d3.axisBottom(x0, x1);
    let yAxis = d3.axisLeft(y);

    function update2(data) {
        d3SelectedSVG.selectAll("rect").remove();
        var u = d3SelectedSVG.selectAll("rect")
            .data(data, function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })
        u.enter()
            .append("rect")
            //.attr("x", function (d) { return x1(d.key); })
            //.attr("y", function (d) { return y(d.value); })
            //.attr("width", x1.bandwidth())
            //.attr("height", function (d) { return (height - y(d.value)); })
            //.attr("fill", function (d) { return z(d.key); });
        //u.exit().remove();
    };

    g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) { return "translate(" + x0(d[xcol]) + ",0)"; })
        .selectAll("rect")
        .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })
        .join(
            (enter) => enter.append('rect')
            , update2(data)
            , (exit) => { exit.remove() }
        )
        .attr("x", function (d) { return x1(d.key); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function (d) { return height - y(d.value); })
        .attr("fill", function (d) { return z(d.key); });

    // check if we have already drawn our axes,
    if (svg.select("g.yaxis").size() < 1) {
        g.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));

        g.append("g")
            .attr("class", "yaxis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count");
    }
    else {
        // we need to do this so our chart updates
        svg.select(".yaxis")
            .transition()
            .call(d3.axisLeft(y).ticks(null, "s"))
            .duration(500);
        svg.select("g.xaxis")
            .transition()
            .call(xAxis)
            .duration(500);
    }

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 17)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", z)
        .attr("stroke", z)
        .attr("stroke-width", 2)
        .on("click", function (d) { update(d) });
    //if (legend.select('text') != d3.selection.empty()) {
    //    legend.select('text').remove()
    //}
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", margin.top)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });

    var filtered = [];

    //// Update and transition on click:
    function update(d) {
        // Update the array to filter the chart by:

        // add the clicked key if not included:
        if (filtered.indexOf(d) == -1) {
            filtered.push(d);
            // if all bars are un-checked, reset:
            if (filtered.length == keys.length) filtered = [];
        }
        // otherwise remove it:
        else {
            filtered.splice(filtered.indexOf(d), 1);
        }

        // Update the scales for each group(/states)'s items:
        var newKeys = [];
        keys.forEach(function (d) {
            if (filtered.indexOf(d) == -1) {
                newKeys.push(d);
            }
        })
        x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

        // update the y axis:
        svg.select(".yaxis")
            .transition()
            .call(d3.axisLeft(y).ticks(null, "s"))
            .duration(500);

        // Filter out the bands that need to be hidden:
        var bars = svg.selectAll(".bar").selectAll("rect")
            .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })

        bars.filter(function (d) {
            return filtered.indexOf(d.key) > -1;
        })
            .transition()
            .attr("x", function (d) {
                return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width")) / 2;
            })
            .attr("height", 0)
            .attr("width", 0)
            .attr("y", function (d) { return height; })
            .duration(500);

        // Adjust the remaining bars:
        bars.filter(function (d) {
            return filtered.indexOf(d.key) == -1;
        })
            .transition()
            .attr("x", function (d) { return x1(d.key); })
            .attr("y", function (d) { return y(d.value); })
            .attr("height", function (d) { return height - y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("fill", function (d) { return z(d.key); })
            .duration(500);

        // update legend:
        legend.selectAll("rect")
            .transition()
            .attr("fill", function (d) {
                if (filtered.length) {
                    if (filtered.indexOf(d) == -1) {
                        return z(d);
                    }
                    else {
                        return "white";
                    }
                }
                else {
                    return z(d);
                }
            })
            .duration(100);


    }

    //});
}

