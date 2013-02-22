"use strict";
var app = {};
var ajax = {
    ajaxurl: window.location.protocol + "//" + window.location.host + "/ajax/",
    loadData: function(id) {
        var loadData = {
            session_id: id
        };
        var loadString = JSON.stringify(loadData);
        $.ajax(this.ajaxurl + "load",
                {
                    data: {data: loadString},
                    success: app.load_success
                });
    },
    saveData: function(data) {
        $.ajax(this.ajaxurl + "save",
                {
                    data: {data: data},
                    success: app.save_success
                })
    }
}
var wolke = function() {
    this.clickX = [];
    this.clickY = [];
    this.currentX = [];
    this.currentY = [];
    this.paint = false;
    this.clickDrag = [];
    this.setSessionID = function(sesid) {
        app.wolken.session_id = sesid;
    };
    this.getSaveData = function() {

        var saveData = {
            clickX: this.clickX,
            clickY: this.clickY
        };
        if (this.session_id)
            saveData.session_id = this.session_id;

        return JSON.stringify(saveData);
    };
    this.loadData = function(data) {
        this.clickX = data.linedata.clickX;
        this.clickY = data.linedata.clickY;
        this.session_id = data.session_id;
    };
    this.pushXY = function(x, y) {
        this.currentX.push(x);
        this.currentY.push(y);
    };
    this.finishCurrent = function() {
        if (this.currentX.length > 0) {
            this.clickX.push(this.currentX);
            this.clickY.push(this.currentY);
        }
        this.currentX = [];
        this.currentY = [];
    };
    this.redraw = function(drawing) {
        var ctx = drawing.get_context();
        for (var i = 0; i < this.clickX.length; i++)
            drawing.redraw_path_fragment(ctx, {X: this.clickX[i], Y: this.clickY[i]});
        drawing.redraw_current(ctx, {X: this.currentX, Y: this.currentY});
    };
};
var drawing = function() {
    this.canvas = $("#canvas");
    this.context = this.canvas[0].getContext("2d");
    this.get_context = function() {
        var ctx = this.context;
        ctx.strokeStyle = "#000";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        return ctx;
    };
    this.redraw_path_fragment = function(ctx, frag) {
        ctx.beginPath();
        ctx.moveTo(frag.X[frag.X.length - 1], frag.Y[frag.X.length - 1]);
        for (var j = frag.X.length - 1; j > 0; j--) {
            ctx.lineTo(frag.X[j], frag.Y[j]);
        }
        ctx.stroke();
    };
    this.redraw_current = function(ctx, cFrag) {
        var currentLength = cFrag.X.length;
        if (currentLength > 1) {
            ctx.beginPath();
            ctx.moveTo(cFrag.X[currentLength - 1], cFrag.Y[currentLength - 1]);
            for (var i = currentLength - 1; i > 0; i--)
                ctx.lineTo(cFrag.X[i], cFrag.Y[i]);
            ctx.stroke();
        }
    };
    this.newImg = function(image) {
        this.canvas.attr({Width: image.width + "px", Height: image.height + "px"}).attr("style", "Border:3px solid black");

        this.context.drawImage(image, 0, 0, image.width, image.height);
    };
    this.loadImage = function(imageUrl) {
        this.cloudImg = $(new Image()).attr("id", "loadImg");
        this.cloudImg.on("load", app.runners.image_loaded)
                .attr("src", imageUrl);
    };
};

app = {
    masterurl: window.location.protocol + "//" + window.location.host + "/",
    wolken: new wolke(),
    drawing: new drawing(),
    saveImage: function() {
        app.queueSave(true);
        app.wolken.finishCurrent();
        ajax.saveData(app.wolken.getSaveData());
    },
    setBrowserUrl: function(newid) {
        var testurl = /\/i\/.{16}$/;
        if (!testurl.test(document.location.href))
            if (window.history.pushState)
                window.history.pushState(null, null, "/i/" + newid);
            else
                window.location.href = imgUrl;
    },
    setTopMessage: function(message) {
        $("#topMessage").html(message);
    },
    save_success: function(data, status, xhr) {
        $("#messageBox").html(data.Message);
        
        app.wolken.setSessionID(data.session_id);
        app.setBrowserUrl(data.session_id);
        var imgUrl = app.masterurl + "i/" + data.session_id;
        app.setTopMessage($("<span>ShareLink:</span> ").append($("<a/>").attr('href', imgUrl).html(imgUrl)));
    },
    load_success: function(data, status, xhr) {
        $("#messageBox").html(data.Message);
        app.wolken.loadData(data);
        app.redraw();
    },
    redraw: function() {
        app.wolken.redraw(app.drawing);
    },
    queueSave: function(clear) {
        if (app.currentTimeout) {
            clearTimeout(app.currentTimeout);
        }
        app.currentTimeout = (clear) ? null : setTimeout(app.saveImage, 1000);
    },
    addClick: function(x, y, dragging)
    {
        dragging ? app.wolken.pushXY(x, y) : app.wolken.finishCurrent();
        app.queueSave();
    },
    runners: {
        install_events: function() {
            var event_element;
            for (event_element in app.events)
                $(event_element).on(app.events[event_element]);
        },
        image_loaded: function() {
            app.drawing.newImg(this);
            var session_id = $("#load_id").val()
            if (session_id)
                ajax.loadData(session_id);
            if (window.File && window.FileList && window.FileReader) {
                app.runners.init_fileDrop();
            }
        },
        init_fileDrop: function() {
            $("#canvas").on({
                dragover: app.handlers.dragover,
                dragleave: app.handlers.dragleave,
                drop: app.handlers.drop
            });
        },
        setup: function() {
            $.ajaxSetup({
                dataType: "json",
                type: 'POST'
            });

            app.drawing.loadImage('/images/wolken2.jpg');
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
        click: app.saveImage
    },
    '#canvas': {
        mouseup: function(e) {
            app.wolken.paint = false;
        }, mouseleave: function(e) {
            app.wolken.paint = false;
        },
        mouseenter: function(e) {
            app.wolken.paint = e.button & 1;
        },
        mousemove: function(e) {
            if (app.wolken.paint) {
                app.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                app.redraw();
            }
        },
        mousedown: function(e) {
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;
            app.wolken.paint = true;
            app.addClick(mouseX, mouseY, false);
            app.redraw();
        }
    }
};
$(window).on('load', app.runners.setup);
$(window).on('load', app.runners.install_events);

