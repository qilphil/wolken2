/* 
 * To change this template, choose Tools | Templates
 * <style>
        .PiYG .q0-9{fill:rgb(197,27,125)}
      .PiYG .q1-9{fill:rgb(222,119,174)}
      .PiYG .q2-9{fill:rgb(241,182,218)}
      .PiYG .q3-9{fill:rgb(253,224,239)}
      .PiYG .q4-9{fill:rgb(247,247,247)}
      .PiYG .q5-9{fill:rgb(230,245,208)}
      .PiYG .q6-9{fill:rgb(184,225,134)}
      .PiYG .q7-9{fill:rgb(127,188,65)}
      .PiYG .q8-9{fill:rgb(77,146,33)}
      path {
          stroke: #000;
      }

      circle {
          fill: #fff;
          stroke: #000;
          pointer-events: none;
      }</style>
script(src='http://d3js.org/d3.v3.min.js')
 * 
 *   * and open the template in the editor.
 */
var runVoronoi = {
    click: function(e) {
        var xyData = [];
        console.log(app.wolken);
        for (var i = 0; i < app.wolken.clickX.length; i++)
            for (var j = 0; j < app.wolken.clickX[i].length; j++)
                xyData.push([app.wolken.clickX[i][j], app.wolken.clickY[i][j]]);
        var svg = d3.select("body").append("svg")
                .attr("width", app.drawing.canvas.width())
                .attr("height", app.drawing.canvas.height())
                .attr("class", "PiYG")
                .style("position", "absolute")
                .style("opacity", "0.6")
                .style("left", app.drawing.canvas.position().left)
                .style("top", app.drawing.canvas.position().top);



        var path = svg.append("g").selectAll("path");

        // creat circles on the xyDatapoints
        svg.selectAll("circle")
                .data(xyData.slice(1))
                .enter().append("circle")
                .attr("transform", function(d) {
            return "translate(" + d + ")";
        })
                .attr("r", 2);

        redraw();

        function redraw() {
            path = path.data(d3.geom.voronoi(xyData).map(function(d) {
                return "M" + d.join("L") + "Z";
            }), String);
            path.exit().remove();
            path.enter().append("path").attr("class", function(d, i) {
                return "q" + (i % 9) + "-9";
            }).attr("d", String);
            path.order();
        }

    }
};

