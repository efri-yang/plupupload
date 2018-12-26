

var uploader = new plupload.Uploader({
    runtimes: 'html5,flash,silverlight,html4',
    browse_button: 'img-add-btn-1', // you can pass an id...
    url: 'upload2.php',
    flash_swf_url: '../js/Moxie.swf',
    silverlight_xap_url: '../js/Moxie.xap',
    multi_selection: true,
    chunk_size: '100kb',
    filters: {
        max_imgfile_count: 3,
        prevent_duplicates: true,
        max_file_size: '3mb',
        mime_types: [
            { title: "Image files", extensions: "jpg,gif,png,psd" },
            { title: "Zip files", extensions: "zip" }
        ]
    }
});
uploader.settings.FILE_COUNT_ERROR = -9001;
console.dir(uploader);


var $uploadBtn = $(".img-upload-btn");
var $pauseBtn = $(".img-pause-btn");
var $addBtn = $("#img-add-btn-1");
var $insertBtn = $(".ft-btn-insert");
var $fileListUL = $(".ckeditor-uploadfile-list");
var $uploadInfo = $(".img-upload-info");
var $uploadProgress = $(".img-upload-allprogress");
var $tipError = $(".ckeditor-uploadfile-errortip");
var $tipErrorClose = $tipError.find(".close");

var stating = "STOPPED";
var errorMsg = "";

var successFile = [];
var errorFile = [];
var fileSize = 0;

$tipErrorClose.on("click", function() {
    $tipError.hide();
})

$(".ckeditor-imgupload-dialog").on("click", ".retry", function() {
    var len = uploader.files.length;
    for (var i = len - 1; i >= 0; i--) {
        if (uploader.files[i].status == 4) {
            uploader.files[i].status = 1;
        }
    }
    uploader.start();
})

$(".ckeditor-imgupload-dialog").on("click", ".ignore", function() {
    var len = uploader.files.length;


    for (var i = len - 1; i >= 0; i--) {
        uploader.removeFile(uploader.files[i]);
    }


})

function previewImage(file, callback) {
    if (!file || !/image\//.test(file.type)) return; //确保文件是图片
    if (file.type == 'image/gif') { //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
        var gif = new moxie.file.FileReader();
        gif.onload = function() {
            callback(gif.result);
            gif.destroy();
            gif = null;
        };
        gif.readAsDataURL(file.getSource());
    } else {
        var image = new moxie.image.Image();
        image.onload = function() {
            image.downsize(150, 150); //先压缩一下要预览的图片,宽300，高300
            var imgsrc = image.type == 'image/jpeg' ? image.getAsDataURL('image/jpeg', 80) : image.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
            callback && callback(imgsrc); //callback传入的参数为预览图片的url
            image.destroy();
            image = null;
        };
        image.load(file.getSource());
    }
}

function preloadThumb(file, cb) {
    var img = new moxie.image.Image();
    var resolveUrl = moxie.core.utils.Url.resolveUrl;
    img.onload = function() {
        var thumb = $('#' + file.id);
        thumb.find(".img-before-preview").hide();
        this.embed(thumb[0], {
            // width: self.options.thumb_width,
            // height: self.options.thumb_height,
            width: 110,
            height: 110,
            crop: false,
            fit: true,
            preserveHeaders: false,
            swf_url: resolveUrl(uploader.settings.flash_swf_url),
            xap_url: resolveUrl(uploader.settings.silverlight_xap_url)
        });
    };

    img.bind("embedded error", function(e) {
        //不支持的浏览器就会触发error事件,支持的浏览器会触发embedded  e.type
        this.destroy();
        setTimeout(function() {
            cb.call(null, e.type)
        }, 1); // detach, otherwise ui might hang (in SilverLight for example)
    });

    $('#' + file.id).removeClass('plupload_thumb_toload').addClass('plupload_thumb_loading');
    img.load(file.getSource());
}

function _handleState() {
    var filesPending = uploader.files.length - (uploader.total.uploaded + uploader.total.failed);
    var maxCount = uploader.getOption('filters').max_imgfile_count || 0;
    if (plupload.STARTED === uploader.state) {
        //此时表示正在上传
        $pauseBtn.show();
    } else if (plupload.STOPPED === uploader.state) {
        //停止上传
        $pauseBtn.hide();

    }
}

function updateTotalText() {
    var text = '';
    if (stating === 'FilesAdded') {
        text = '选中' + uploader.files.length + '张图片，共' + plupload.formatSize(fileSize) + '。';
    } else if (stating === 'UploadComplete') {
        text = '共' + uploader.files.length + '张（' + plupload.formatSize(fileSize) + '），已上传' + uploader.total.uploaded + '张';
        if (uploader.total.failed) {
            text += '，失败' + uploader.total.failed + '张,<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>';
        }
    } else if (stating === 'Del') {
        text = '选中' + uploader.files.length + '张图片';
        if (uploader.total.uploaded) {
            text += ',已上传' + uploader.total.uploaded + '张';
        }
    }
    $uploadInfo.html(text);
}




function updateTotalProgress() {
    $uploadProgress.find(".txt").text(uploader.total.percent + "%");
    $uploadProgress.find(".percentage").width(uploader.total.percent + "%");
}






uploader.bind("Init", function(uploader) {
    console.group("Init事件:当Plupload初始化完成后触发监听函数参数：(uploader)");
});

uploader.bind("PostInit", function() {
    console.group("PostInit事件:当Init事件发生后触发监听函数参数：(uploader)");
    $uploadBtn.on("click", function() {
        uploader.start();
    });

    $pauseBtn.click(function(e) {
        uploader.stop();
        e.preventDefault();
    });
});

uploader.bind("Browse", function(up) {
    console.group("Browse事件")
});

plupload.extend(uploader.getOption('filters'), {
    max_imgfile_count: uploader.settings.max_imgfile_count
});


plupload.addFileFilter('max_imgfile_count', function(maxCount, file, cb) {
    if (maxCount <= uploader.files.length - (uploader.total.uploaded + uploader.total.failed)) {
        //抛出上传个数限制
        uploader.trigger('error', {
            code: -9001,
            file: file
        })
        cb(false);
    } else {
        cb(true);
    }
});

console.dir(plupload);


uploader.bind('FileFiltered', function(up, file) {
    console.group("FileFiltered事件");
    if (uploader.settings.filters.max_imgfile_count <= uploader.files.length - (uploader.total.uploaded + uploader.total.failed)) {
        alert("dxxx");
        $addBtn.addClass('disabled');
    }
});

uploader.bind('FilesAdded', function(up, files) {
    console.group("FilesAdded事件");
    console.dir(files);
    $uploadBtn.removeClass("disabled");
    var str = "";
    var $beforePreview;
    var $afterPreview;
    plupload.each(files, function(file) {
        var str = '<li id="' + file.id + '">' +
            '<div class="img-before-preview">' +
            '<p class="title">' + file.name + '</p>' +
            '<p class="txt-error-tip"></p>' +
            '<p class="img-loading"></p>' +
            '</div>' +
            '<div class="img-after-preview">' +
            '<img src="" class="img-upload" />' +
            '</div>' +
            '<div class="img-progress"><span></span></div>' +
            '<a href="#" class="img-del-btn"></a>' +
            '<span class="img-success"></span>' +
            '<span class="img-error">上传失败，请重试</span>' +
            '</li>';
        var $str = $(str);
        $str.appendTo($fileListUL);
        $beforePreview = $str.find('.img-before-preview');
        $afterPreview = $str.find(".img-after-preview");
        $del = $str.find(".img-del-btn");
        fileSize += file.size;
        $del.show();
        $del.on("click", function() {
            uploader.removeFile(file);
            stating = 'Del';
            updateTotalText();
            if (!uploader.total.loaded) {
                $insertBtn.addClass("disabled");
            }
        })

        preloadThumb(file, function(type) {
            if (type == "error") {
                $str.find(".img-loading").hide();
                $str.find(".txt-error-tip").text("改浏览器不支持此类型文件预览").show();

            } else {
                $beforePreview.hide();
            }



        })
    });

    stating = "FilesAdded";

    updateTotalText();


});





uploader.bind('QueueChanged', function(up) {
    console.group("QueueChanged事件");
    _handleState();

});

uploader.bind('Refresh', function(up) {
    console.group("Refresh事件");

});




uploader.bind('BeforeUpload', function(up, file) {
    console.group("BeforeUpload事件");
    console.dir(file);
    var $li = $("#" + file.id);
    var $propress = $li.find(".img-progress").show();
    $li.find(".img-del-btn").hide();
    $uploadProgress.show();
    $uploadInfo.hide();
    stating = "UploadProgress";
    updateTotalProgress();
});
uploader.bind('UploadProgress', function(up, file) {
    console.group("UploadProgress事件");
    console.dir(file);
    var $li = $("#" + file.id);
    var $propress = $li.find(".img-progress").show();
    $propress.children('span').css("width", file.percent + "%");
    updateTotalProgress();
});




uploader.bind('FileUploaded', function(up, file, info) {
    console.dir(info);
    console.group("FileUploaded事件");
    var $li = $("#" + file.id);
    var $propress = $li.find(".img-progress").hide();
    $li.find(".img-success").show();
    $li.attr("data-src", info.response);
    $li.find(".img-del-btn").show();

    successFile.push(file);


});

uploader.bind('StateChanged', function(up) {
    //当前的上传状态，可能的值为plupload.STARTED或plupload.STOPPED，该值由Plupload实例的stop()或statr()方法控制。默认为plupload.STOPPED
    console.group("StateChanged事件");

    if (!uploader.total.uploaded) {
        $insertBtn.addClass("disabled");
    } else {
        $insertBtn.removeClass("disabled");
    }
    _handleState();
});


//一下子上传10张图片，也只会触发一次 
//完成以后判断有多少张图片是成功的，多少张是失败的，对于失败的图片 重新上传 还是忽略

uploader.bind('UploadComplete', function(up, files) {
    console.group("UploadComplete事件");
    $uploadProgress.hide();
    $uploadInfo.show();
    stating = "UploadComplete";
    updateTotalText();


});






uploader.bind('FilesRemoved', function(up, files) {
    console.group("FilesRemoved事件");

    $.each(files, function(index, file) {
        $("#" + file.id).remove();
        fileSize -= file.size;

    });

    updateTotalText();


    setTimeout(function() {
        if (!uploader.total.queued) {
            $uploadBtn.addClass("disabled");
        }
    })



});

uploader.bind('ChunkUploaded', function(up, file, info) {
    console.group("ChunkUploaded事件")
});

uploader.bind('Destroy', function() {
    console.group("Destroy事件")
});

uploader.bind('OptionChanged', function(up, name, value, oldValue) {
    console.group("OptionChanged事件")
});


uploader.bind('Error', function(up, err) {
    var details = "";



    switch (err.code) {
        case plupload.FILE_EXTENSION_ERROR:
            details = err.file.name + "文件不符合格式要求！";
            break;

        case plupload.FILE_SIZE_ERROR:
            details = "单个文件大小不能超过" + plupload.formatSize(plupload.parseSize(up.getOption('filters').max_file_size)) + ",文件" + err.file.name + "大小为：" + plupload.formatSize(err.file.size);
            break;

        case plupload.FILE_DUPLICATE_ERROR:
            details = err.file.name + "上传已经在队列中了！";
            break;

        case uploader.settings.FILE_COUNT_ERROR:
            details = "每次上传文件总数不能超过" + up.getOption('filters').max_imgfile_count + "个,多出的文件将不被上传！";
            break;

        case plupload.IMAGE_FORMAT_ERROR:
            details = _("Image format either wrong or not supported.");
            break;

        case plupload.IMAGE_MEMORY_ERROR:
            details = _("Runtime ran out of available memory.");
            break;
        case plupload.HTTP_ERROR:
            details = "上传的URL出现错误或着文件不存在！";
            break;
    }

    $tipError.show().find(".txt").html(details);










});















uploader.init();