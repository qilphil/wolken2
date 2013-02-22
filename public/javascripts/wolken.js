"use strict";
var app = {};
var wolke = function() {
    this.canvas = 0;
    this.clickX = [];
    this.clickY = [];
    this.currentX = [];
    this.currentY = [];
    this.paint = false;
    this.clickDrag = [];
    this.context = 0
};
app = {
    masterurl: window.location.protocol + "//" + window.location.host + "/",
    ajaxurl: window.location.protocol + "//" + window.location.host + "/ajax/",
    runit: function() {
        app.queueSave(true);
        app.finishCurrent();
        var saveData = {
            clickX: app.states.clickX,
            clickY: app.states.clickY
        };
        if (app.states.session_id)
            saveData.session_id = app.states.session_id;

        var saveString = JSON.stringify(saveData);
        //$("#messageBox").load(app.masterurl + "save", {data: saveString});
        $.ajax(app.ajaxurl + "save",
                {
                    data: {data: saveString},
                    success: app.save_success
                });
    },
    save_success: function(data, status, xhr) {
        $("#messageBox").html(data.Message);
        app.states.session_id = data.session_id;
        var imgUrl = app.masterurl + "i/" + data.session_id;
        var testurl = /\/i\/.{16}$/;
        if (!testurl.test(document.location.href))
        {
            var newUrl = "/i/" + data.session_id;
            if (window.history.pushState) {
                window.history.pushState(null, null, newUrl);
            }
            else {
                window.location.href = imgUrl;
            }
        }
        ;
        $("#topMessage").html($("<a/>").attr('href', imgUrl).html(imgUrl)).prepend("<span>ShareLink:</span> ");
    },
    load_success: function(data, status, xhr) {
        $("#messageBox").html(data.Message);
        app.states.clickX = data.linedata.clickX;
        app.states.clickY = data.linedata.clickY;
        app.states.session_id = data.session_id;
        app.redraw();
    },
    states: new wolke(),
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
            app.redraw_path_fragment(ctx, app.states.clickX[i], app.states.clickY[i]);

        app.redraw_current(ctx);
    },
    finishCurrent: function() {
        if (app.states.currentX.length > 0) {
            app.states.clickX.push(app.states.currentX);
            app.states.clickY.push(app.states.currentY);
        }
        app.states.currentX = [];
        app.states.currentY = [];
    },
    queueSave: function(clear) {
        if (app.states.currentTimeout) {
            clearTimeout(app.states.currentTimeout);
        }
        app.states.currentTimeout = (clear) ? null : setTimeout(app.runit, 1000);
    },
    addClick: function(x, y, dragging)
    {
        if (dragging) {
            app.states.currentX.push(x);
            app.states.currentY.push(y);
        }
        else {
            app.finishCurrent();

        }
        app.queueSave();
    },
    runners: {
        install_events: function() {
            var event_element;
            for (event_element in app.events) {
                $(event_element).on(app.events[event_element]);
            }

        },
        image_loaded: function() {

            app.states.canvas.attr({Width: this.width + "px", Height: this.height + "px"}).attr("style", "Border:3px solid black");
            app.states.context = app.states.canvas[0].getContext("2d");
            app.states.context.drawImage(this, 0, 0, this.width, this.height);
            var session_id = $("#load_id").val();
            if (session_id != "") {
                var loadData = {
                    session_id: session_id
                };

                var loadString = JSON.stringify(loadData);

                $.ajax(app.ajaxurl + "load",
                        {
                            data: {data: loadString},
                            success: app.load_success
                        });
            }
            ;
            if (window.File && window.FileList && window.FileReader) {
                app.runners.init_fileDrop();
            }
        },
        init_fileDrop: function() {
            $("#canvas").on({
                dragover: app.handlers.dragover,
                dragleave: app.handlers.dragleave,
                drop: app.handlers.drop,
            });
        },
        loadImage: function(imageUrl) {
            app.states.loadImg = $(new Image()).attr("id", "loadImg");
            app.states.loadImg.on("load", app.runners.image_loaded)
                    .attr("src", imageUrl);

        },
        setup: function() {
            app.states.canvas = $("<canvas/>").attr("id", "canvas");
            $('#mainimg').append(app.states.canvas);
            $.ajaxSetup({
                dataType: "json",
                type: 'POST'
            });
            app.runners.loadImage('/images/wolken2.jpg');
        }

    },
    handlers: {
        dragover: function() {
            $(this).css("border-color", "green");
        },
        dragleave: function() {
            $(this).css("border-color", "black");
        },
        drop: function() {

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

