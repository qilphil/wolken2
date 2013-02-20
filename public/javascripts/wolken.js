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
        currentX: [],
        currentY: [],
        paint: false,
        clickDrag: [],
        context: 0
    },
    redraw_path_fragment: function(ctx, drawX, drawY) {
        ctx.beginPath();
        ctx.moveTo(drawX[drawX.length - 1], drawY[drawX.length - 1]);
        for (var j = drawX.length - 1; j > 0; j--) {
            ctx.lineTo(drawX[j], drawY[j]);
        }
        ctx.stroke();
    },
    redraw_current: function(ctx) {
        var currentLength = app.states.currentX.length;
        if (currentLength > 1) {
            ctx.beginPath();
            ctx.moveTo(app.states.currentX[currentLength - 1], app.states.currentY[currentLength - 1]);
            for (var i = currentLength - 1; i > 0; i--)
                ctx.lineTo(app.states.currentX[i], app.states.currentY[i]);
            ctx.stroke();
        }
    },
    get_context: function() {
        var ctx = app.states.context;
        ctx.strokeStyle = "#000";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        return ctx;
    },
    redraw: function() {
        var ctx = app.get_context();
        for (var i = 0; i < app.states.clickX.length; i++)
            app.redraw_path_fragment(ctx, app.states.clickX[i], app.states.clickY[i])
        app.redraw_current(ctx);

    },
    addClick: function(x, y, dragging)
    {
        if (dragging) {
            app.states.currentX.push(x);
            app.states.currentY.push(y);
        }
        else {
            if (app.states.currentX.length > 0) {
                app.states.clickX.push(app.states.currentX);
                app.states.clickY.push(app.states.currentY);
            }
            app.states.currentX = [];
            app.states.currentY = [];
        }

    },
    runners: {
        install_events: function() {
            var event_element;
            for (event_element in app.events) {
                $(event_element).on(app.events[event_element]);
            }

        },
        image_loaded: function() {

            app.states.canvas.attr({Width: this.width + "px", Height: this.height + "px"}).attr("style", "Border:1px solid black")
            app.states.context = app.states.canvas[0].getContext("2d");
            app.states.context.drawImage(this, 0, 0, this.width, this.height);
        },
        setup: function() {
            app.states.canvas = $("<canvas/>").attr("id", "canvas");
            $('#mainimg').append(app.states.canvas);
            app.states.loadImg = $(new Image()).attr("id", "loadImg");
            app.states.loadImg.on("load", app.runners.image_loaded)
                    .attr("src", 'images/wolken2.jpg');
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
            app.addClick(mouseX, mouseY, false);
            app.redraw();
        }
    }
};
$(window).on('load', app.runners.setup);
$(window).on('load', app.runners.install_events);
