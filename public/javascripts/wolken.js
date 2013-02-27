"use strict";
var app = {};

var ajax = {
    ajaxurl: window.location.protocol + "//" + window.location.host + "/ajax/",
    loadData: function(id, load_success) {
        var loadData = {
            session_id: id
        };
        var loadString = JSON.stringify(loadData);
        $.ajax(this.ajaxurl + "load",
                {
                    data: {data: loadString},
                    success: load_success
                });
    },
    listData: function(maxcount, list_success) {
        var loadData = {
            maxcount: maxcount
        };
        var loadString = JSON.stringify(loadData);
        $.ajax(this.ajaxurl + "list",
                {
                    data: {data: loadString},
                    success: list_success
                });
    },
    saveData: function(data) {
        $.ajax(this.ajaxurl + "save",
                {
                    data: {data: data},
                    success: app.save_success
                });
    },
    uploadBackground: function(fileName, fileData) {
        var saveData = {
            fileName: fileName,
            fileData: fileData
        };
        var saveString = JSON.stringify(saveData);
        $.ajax(this.ajaxurl + "uploadBackground", {data: {data: saveString},
            success: app.backgroundSuccess});
    }
};
var wolke = function(session_id) {
    this.clickX = [];
    this.clickY = [];
    this.currentX = [];
    this.currentY = [];
    this.paint = false;
    this.clickDrag = [];
    this.session_id = session_id;
    if (session_id)
        this.loadSession(session_id)
};
wolke.prototype.setSessionID = function(sesid) {
    this.session_id = sesid;
};
wolke.prototype.loadSession = function(session_id) {
    if (session_id)
        ajax.loadData(session_id, this.dataLoaded);
};
wolke.prototype.dataLoaded = function(data, status, xhr) {
    app.wolken.copyLineData(data);
    app.setMessage(data.Message);
    app.redraw();
    if (data.linedata.altImage)
    {
        app.drawing.loadImage(data.linedata.altImage);
        this.altImage = data.linedata.altImage;
    }
};
wolke.prototype.getSaveData = function() {
    var saveData = {
        clickX: this.clickX,
        clickY: this.clickY
    };
    if (this.altImage) {
        saveData.altImage = this.altImage;
    }
    if (this.session_id)
        saveData.session_id = this.session_id;
    return JSON.stringify(saveData);
};
wolke.prototype.copyLineData = function(data) {
    this.clickX = data.linedata.clickX;
    this.clickY = data.linedata.clickY;
    this.session_id = data.session_id;
};
wolke.prototype.pushXY = function(x, y) {
    this.currentX.push(x);
    this.currentY.push(y);
};
wolke.prototype.finishCurrent = function() {
    if (this.currentX.length > 0) {
        this.clickX.push(this.currentX);
        this.clickY.push(this.currentY);
    }
    this.currentX = [];
    this.currentY = [];
};
wolke.prototype.redraw = function(drawing) {
    var ctx = drawing.get_context();
    for (var i = 0; i < this.clickX.length; i++)
        drawing.redraw_path_fragment(ctx, {X: this.clickX[i], Y: this.clickY[i]});
    drawing.redraw_current(ctx, {X: this.currentX, Y: this.currentY});
};

var drawing = function(imageUrl) {
    this.canvas = $("#canvas");
    this.context = this.canvas[0].getContext("2d");
    if (imageUrl)
        this.loadImage(imageUrl);
};
drawing.prototype.get_context = function() {
    var ctx = this.context;
    ctx.strokeStyle = "#000";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    return ctx;
};
drawing.prototype.redraw_path_fragment = function(ctx, frag) {
    ctx.beginPath();
    ctx.moveTo(frag.X[frag.X.length - 1], frag.Y[frag.X.length - 1]);
    for (var j = frag.X.length - 1; j > 0; j--) {
        ctx.lineTo(frag.X[j], frag.Y[j]);
    }
    ctx.stroke();
};
drawing.prototype.redraw_current = function(ctx, cFrag) {
    var currentLength = cFrag.X.length;
    if (currentLength > 1) {
        ctx.beginPath();
        ctx.moveTo(cFrag.X[currentLength - 1], cFrag.Y[currentLength - 1]);
        for (var i = currentLength - 1; i > 0; i--)
            ctx.lineTo(cFrag.X[i], cFrag.Y[i]);
        ctx.stroke();
    }
};
drawing.prototype.loadImage = function(imageUrl) {
    this.cloudImg = $(new Image()).attr("id", "canvasImg");
    if (imageUrl != app.defaultImgUrl) {
        app.wolken.altImage = imageUrl;
    };
    this.cloudImg.on("load", this.image_loaded)
            .attr("src", imageUrl);
};
drawing.prototype.displayImage = function(image) {
    this.canvas.attr({Width: image.width + "px", Height: image.height + "px"}).attr("style", "Border:3px solid black");
    this.context.drawImage(image, 0, 0, image.width, image.height);
};
drawing.prototype.image_loaded = function() {
    app.drawing.displayImage(this);

    app.redraw();
};


app = {
    masterurl: window.location.protocol + "//" + window.location.host + "/",
    defaultImgUrl: '/images/wolken2.jpg',
    wolken: null,
    drawing: null,
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
    setMessage: function(message) {
        $("#topStatus").html(message);
    },
    backgroundSuccess: function(data, status) {
        app.wolken.altImage = data.backgroundUrl;
        app.setMessage(data.Message);
        app.saveImage();
    },
    save_success: function(data, status, xhr) {
        $("#messageBox").html(data.Message);
        app.wolken.setSessionID(data.session_id);
        app.setBrowserUrl(data.session_id);
        var imgUrl = app.masterurl + "i/" + data.session_id;
        app.setTopMessage($("<span>ShareLink:</span> ").append($("<a/>").attr('href', imgUrl).html(imgUrl)));
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
    showList: function(data, status, xhr) {
        var listData = data.listdata;
        _.each(listData, function(k, v) {
        });
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
            app.runners.init_fileDrop();
        },
        init_fileDrop: function() {
            jQuery.event.fixHooks.drop = {
                props: ['dataTransfer']
            };
            $("#canvas").on(app.filedrop_handlers);
        },
        setup: function() {
            $.ajaxSetup({
                dataType: "json",
                type: 'POST'
            });
            app.drawing = new drawing(app.defaultImgUrl);
            app.wolken = new wolke($("#load_id").val());
        }
    },
    filedrop_handlers: {
        dragover: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).css("border-color", "green");
        },
        dragleave: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).css("border-color", "black");
        },
        drop: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).css("border-color", "black");
            var droppedFiles = e.target.files || e.dataTransfer.files;

            if (droppedFiles.length > 0)
            {
                var file = droppedFiles[0];
                var re_jpg = /.jpe?g$/i;
                if (re_jpg.test(file.name)) {
                    var fr = new FileReader();
                    fr.onload = function(e) {
                        app.drawing.loadImage(e.target.result);
                        ajax.uploadBackground(file.name, e.target.result);
                    };
                    fr.readAsDataURL(file);
                }
                else
                    app.setMessage("JPG Files only !");
            }
      },
        dragexit: function(e) {
            e.stopPropagation();
            e.preventDefault();

            $(this).css("border-color", "black");
        }
    }
};

app.events = {
    '#runList': {
        click: function(e) {
            e.stopPropagation();
            e.preventDefault();
            ajax.listData(30, app.showList);
        }
    },
    '#canvas': {
        mouseup: function(e) {
            app.wolken.paint = false;

        },
        mouseout: function(e) {
            app.wolken.paint = false;
            app.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false);
        },
        mouseover: function(e) {
            var buttons = e.buttons == 'undefined' ? e.which : e.buttons;
            app.wolken.paint = buttons & 1;
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

