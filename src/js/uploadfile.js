




var uploader = new plupload.Uploader({
    runtimes: 'html5,flash,silverlight,html4',
    browse_button: 'J_pickfiles', // you can pass an id...
    url: './php/upload2.php',
    flash_swf_url: './js/plupload/Moxie.swf',
    silverlight_xap_url: './js/plupload/Moxie.xap',
    chunk_size:0,
    multi_selection:true,
    multipart_params:{},
    filters: {
        prevent_duplicates: true,
        max_file_size: '30mb',
        mime_types: [
            { title: "Image files", extensions: "jpg,gif,png" },
            { title: "Zip files", extensions: "zip" }
        ]
    },
    resize:{
        // width: 100,
        // height: 100,
        // //是否裁剪图片
        // crop: true,
        //压缩后图片的质量，只对jpg格式的图片有效，默认为90。quality可以跟width和height一起使用，但也可以单独使用，单独使用时，压缩后图片的宽高不会变化，但由于质量降低了，所以体积也会变小
        quality: 60,
        //压缩后是否保留图片的元数据，true为保留，false为不保留,默认为true。删除图片的元数据能使图片的体积减小一点点
        preserve_headers: false
    }
});


console.dir(uploader);













var $container=$("#J_coms-plupload-1");
var $noFile=$container.find(".coms-plupload-nofile");
var $choiceBtn=$("#J_pickfiles");//选择文件按钮
var $uploadUL=$container.find(".coms-upload-list");//ul列表








uploader.bind("Init", function(uploader) {
    console.group("Init事件:当Plupload初始化完成后触发监听函数参数：(uploader)");
});

uploader.bind("PostInit", function() {
    console.group("PostInit事件:当Init事件发生后触发监听函数参数：(uploader)");
});

uploader.bind("Browse", function(up) {
    console.group("Browse事件")
});

uploader.bind('FileFiltered', function(up, file) {
    console.group("FileFiltered事件");

});



function preloadThumb(file,$previewPic,cb) {
    var img = new moxie.image.Image();
    var resolveUrl = moxie.core.utils.Url.resolveUrl;
    img.onload = function() {
        this.embed($previewPic[0], {
            // width: self.options.thumb_width,
            // height: self.options.thumb_height,
            width:uploader.settings.resize.width,
            height: uploader.settings.resize.height,
            crop: uploader.settings.resize.crop,
            fit: true,
            preserveHeaders: uploader.settings.resize.preserve_headers,
            swf_url: resolveUrl(uploader.settings.flash_swf_url),
            xap_url: resolveUrl(uploader.settings.silverlight_xap_url)
        });
    };

    img.bind("embedded error", function(e) {
        //不支持的预览的文件浏览器就会触发error事件,
        //支持的浏览器会触发embedded
        this.destroy();
        setTimeout(function() {
            cb.call(null, e.type)
        }, 1); // detach, otherwise ui might hang (in SilverLight for example)
    });

    
    img.load(file.getSource());
}



uploader.bind('FilesAdded', function(up, files) {
    console.group("FilesAdded事件");
    
    plupload.each(files, function(file) {
        var str = '<li id="' + file.id + '">' +
                        '<div class="img-wrap">'+
                            '<div class="preview-tip"><span>预览中...</span></div>'+
                            '<div class="preview-name"><span></span></div>'+
                            '<div class="preview-pic"></div>'+
                         '</div>'+
                            '<div class="handle-bar">'+
                                '<span class="upbtn-del">删除</span>'+
                                '<span class="upbtn-upload">上传</span>'+
                            '</div>'+
                            '<p class="progressing"><span style="width:0%;"></span></p>'+
                            '<span class="error">上传失败，请重试</span>'+
                            '<span class="upbtn-del-local"></span>'+
                            '<span class="upbtn-del-server"></span>'+
                            '<span class="successing"></span>'+
                    '</li>';

        var $li = $(str);
        $li.appendTo($uploadUL);

        var $img=$li.find(".uploadimg");
        var $previewPic=$li.find(".preview-pic");
        var $previewTip=$li.find(".preview-tip");
        var $previewName=$li.find(".preview-name");
        var $handerBar=$li.find(".handle-bar");
        var $delQueuedBtn=$handerBar.find(".upbtn-del");
        var $uploadQueuedBtn=$handerBar.find(".upbtn-upload");


        $handerBar.show();

        preloadThumb(file,$previewPic,function(type) {
            $previewTip.hide();
            if (type == "error") {
                $previewName.show().children().html('暂不支持该文件预览<br/>'+file.name);
            } else {
               $previewPic.show();
            }
        });
        //删除按钮(队列)
        $delQueuedBtn.on("click",function(){
            up.removeFile(file);
        });
        //上传按钮
        $uploadQueuedBtn.on("click",function(){
            up.start();
        })


    });

    
});


uploader.bind('QueueChanged', function(up) {
    console.group("QueueChanged事件"); 
    console.dir(up);
});
uploader.bind('StateChanged', function(up) {
    //暂时不知道这个的作用
    //
    //
    //执行两次，一个是开始上传的时候
    //然后是上传后FileUploaded 后执行 或者是在Error事件后执行StateChanged，但是两次的执行竟然up.total是一样的
    console.group("StateChanged事件");
    console.dir(up);
});



uploader.bind('Refresh', function(up) {
    console.group("Refresh事件");
    //QueueChanged都会触发refresh函数，如果有上传的获取是有队列的时候,那么默认的图片就应该隐藏
    if(up.total.queued || up.total.uploaded){
       $noFile.hide();
    }else{
        $noFile.show();
        
    }
});



uploader.bind('BeforeUpload', function(up, file) {
    console.group("BeforeUpload事件");
    $("#"+file.id).find(".progressing").show();
    $("#"+file.id).find(".handle-bar").hide();

});

uploader.bind('UploadFile', function(up, file) {
    console.group("UploadFile事件");
});






uploader.bind('UploadProgress', function(up, file) {
    console.group("UploadProgress事件");
    $("#"+file.id).find(".progressing").children().css("width", file.percent + "%");
});

uploader.bind('ChunkUploaded', function(up, file, info) {
    console.group("ChunkUploaded事件")
});

//文件上传成功才会触发
uploader.bind('FileUploaded', function(up, file, info) {
    console.group("FileUploaded事件");
    $("#"+file.id).find(".successing").show();

});




//固定会触发的
uploader.bind('UploadComplete', function(up, files) {
    console.group("UploadComplete事件");
    $.each(files,function(index,file){
        $("#"+file.id).find(".progressing").hide();
    });
});


uploader.bind('FilesRemoved', function(up, files) {
    console.group("FilesRemoved事件");
    $.each(files,function(index,file){
        $("#"+file.id).remove();
    })

});


uploader.bind('Destroy', function() {
    console.group("Destroy事件")
});

uploader.bind('OptionChanged', function(up, name, value, oldValue) {
    console.group("OptionChanged事件")
});



uploader.bind('Error', function(up, err) {
    console.group("Error事件");
    console.dir(err.code);
     switch (err.code) {
                    case plupload.FILE_EXTENSION_ERROR:
                        details = err.file.name + "文件不符合格式要求！";
                        break;

                    case plupload.FILE_SIZE_ERROR:
                        details = "单个文件大小不能超过" + plupload.formatSize(plupload.parseSize(up.getOption('filters').max_file_size)) + ",<br/>文件(" + err.file.name + ")大小为：" + plupload.formatSize(err.file.size);
                        break;

                    case plupload.FILE_DUPLICATE_ERROR:
                        details = err.file.name + "已经在队列中了！";
                        break;

                    case plupload.HTTP_ERROR:
                        details = "上传的URL出现错误或着文件不存在！";
                        break;

                    case plupload.IMAGE_FORMAT_ERROR:
                        details = _("Image format either wrong or not supported.");
                        break;

                    case plupload.IMAGE_MEMORY_ERROR:
                        details = _("Runtime ran out of available memory.");
                        break;
                    
                }
                layer.msg(details);
                
});



uploader.init();





