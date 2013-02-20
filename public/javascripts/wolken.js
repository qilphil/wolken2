"use strict";

var app = {};
app = {
    masterurl: window.location.protocol + "//" + window.location.host + "/ajax/",
    runit: function() {

        $("#heroheader").load(app.masterurl + "User");
    },
    ajax_success: {
    },
    states: {
        canvas: 0,
        clickX: [],
        clickY: [],
        paint: false,
        clickDrag: [],
        context: 0
    },
    redraw: function() {
//        app.states.canvas[0].width = app.states.canvas[0].width; // Clears the canvas
        var ctx = app.states.context;
        ctx.strokeStyle = "#000";
        ctx.lineJoin = "round";
        ctx.lineWidth = 1;
        for (var i = 0; i < app.states.clickX.length; i++)
        {
            ctx.beginPath();
            if (app.states.clickDrag[i] && i) {
                ctx.moveTo(app.states.clickX[i - 1], app.states.clickY[i - 1]);
            } else {
                ctx.moveTo(app.states.clickX[i] - 1, app.states.clickY[i] - 1);
            }
            ctx.lineTo(app.states.clickX[i], app.states.clickY[i]);
            ctx.closePath();
            ctx.stroke();
        }
    },
    addClick: function(x, y, dragging)
    {
        app.states.clickX.push(x);
        app.states.clickY.push(y);
        app.states.clickDrag.push(dragging);
    },
    runners: {
        install_events: function() {
            var event_element;
            for (event_element in app.events) {
                $(event_element).on(app.events[event_element]);
            }

        },
        setup: function() {
            var canvasImg = $('#mainimg2');
            app.states.canvas = $("<canvas/>").attr("id", "canvas");
            
            $('#mainimg').append(app.states.canvas);
            
            app.states.loadImg= $(new Image()).attr("id","loadImg");
            app.states.loadImg.on("load",function(){
                app.states.canvas.attr({Width: this.width + "px", Height: this.height + "px",Border:"1px solid black"})
                app.states.context = app.states.canvas[0].getContext("2d");
                app.states.context.drawImage(this, 0, 0, this.width, this.height);
            })
                .attr("src",'images/wolken2.jpg')
        }
    }
};
app.events = {
    "#runbutton": {
        click: app.runit
    },
    '#canvas': {
        mouseup: function(e) {
            app.states.paint = false;
        }, mouseleave: function(e) {
            app.states.paint = false;
        },
        mouseenter: function(e) {
            app.states.paint = e.button & 1;
        },
        mousemove: function(e) {
            if (app.states.paint) {
                app.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                app.redraw();
            }
        },
        mousedown: function(e) {
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;

            app.states.paint = true;
            app.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false);
            app.redraw();
        }
    }
};
$(window).on('load', app.runners.setup);
$(window).on('load', app.runners.install_events);
