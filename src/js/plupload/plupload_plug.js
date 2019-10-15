(function($, plupload) {
    plupload.FILE_COUNT_ERROR = -9001;
    plupload.addFileFilter("max_file_count", function(maxFileCount, file, cb) {
        // console.group('max_file_count事件');
        // if (maxFileCount <= this.files.length - (this.total.uploaded + this.total.failed)) {
        if (maxFileCount <= this.files.length) {
            this.disableBrowse(true);
            this.trigger('Error', {
                code: plupload.FILE_COUNT_ERROR,
                message: "上传文件个数超出限制",
                file: file
            });
            cb(false);
        } else {
            cb(true);
        }
    });



    function toggleBrowseButton(up) {
        if (up.settings.filters.max_file_count <= up.files.length) {
            up.disableBrowse(true);
            up.$choiceBtn.addClass("disabled");
            up.settings.isBrowseEndShow && up.$choiceBtn.parents("li").addClass('disabled');
        } else {
            up.disableBrowse(false);
            up.$choiceBtn.removeClass("disabled");
            up.settings.isBrowseEndShow && up.$choiceBtn.parents("li").removeClass('disabled');
        }
    }
    function toggleHanderBar(up, file, eventing) {
        switch (eventing) {
            case "FilesAdded":
                file.$handerBar.show();
                if (up.settings.filters.max_file_count <= 1) {
                    file.$uploadQueuedBtn.show();
                }
                break;
            case "BeforeUpload":
                file.$handerBar.hide();
                break;
            case "FileUploadedSuccess":
                file.$handerBar.hide();
                break;
            case "FileUploadedFail":
                file.$handerBar.show();
                if (up.settings.filters.max_file_count <= 1) {
                    file.$uploadQueuedBtn.show();
                }
                break;
            case "UploadComplete":
                file.$handerBar.show();
                break;
        }
    }


    function toggleStartUpload(up, eventing) {
        if (up.settings.filters.max_file_count <= 1) return;
        switch (eventing) {
            case "Refresh":
            case "UploadComplete":
                if ((up.files.length - up.total.uploaded > 0) || up.total.failed) {
                    up.$btnStartload.show().removeClass('disabled');

                } else {
                    up.$btnStartload.addClass('disabled');
                }
                break;
            case "BeforeUpload":
                up.$btnStartload.addClass('disabled');
                break;
            case "Pausing":
                up.$btnStartload.removeClass('disabled');
                break;
        }

    }

    function toggleStopUpload(up, eventing) {
        if (up.settings.filters.max_file_count <= 1) return;
        switch (eventing) {
            case "BeforeUpload":
                up.$btnStopload.removeClass('disabled').show();
                break;
            case "UploadComplete":
                up.$btnStopload.removeClass('disabled').hide();
                break;
            case "Pausing":
                up.$btnStopload.addClass('disabled');
                break;
        }
    }

     function toggleDelUploadSLBtn(up, file, eventing) {
        if (!up.settings.delSLBtn) return;
        switch (eventing) {
            case "FileUploadedSuccess":
                file.$delUploadSLBtn.show();
                break;
        }
    }



   


    function preloadThumb(file, $previewPic, cb, uploader) {
        var img = new moxie.image.Image();
        var resolveUrl = moxie.core.utils.Url.resolveUrl;
        img.onload = function() {
            this.embed($previewPic[0], {
                // width: self.options.thumb_width,
                // height: self.options.thumb_height,
                width: uploader.settings.resize.width,
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


    function toggleUploadInfo(up, eventing) {

        if (!up.settings.uploadInfo.required || !up.$uploadInfo.length) return;

        var text = '';
        console.dir(up.files)
        console.dir(up.total.size);
        if (eventing == "UploadComplete") {

            text = '共' + up.files.length + '张（' + plupload.formatSize(up.total.size) + '），已上传' + up.total.uploaded + '张';
            if (up.total.failed) {
                text += '，失败' + up.total.failed + '张,<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>';
            }
            up.$uploadInfo.$progress.hide();
        } else if (eventing == "BeforeUpload") {
            up.$uploadInfo.$progress.$txt.html(up.total.percent + "%");
            up.$uploadInfo.$progress.$percent.width(up.total.percent + "%");
            up.$uploadInfo.$progress.show();
        } else if (eventing == "UploadProgress") {
            up.$uploadInfo.$progress.$txt.html(up.total.percent + "%");
            up.$uploadInfo.$progress.$percent.width(up.total.percent + "%");
        } else {
            if (up.total.uploaded || up.total.failed) {
                text = '共' + up.files.length + '张（' + plupload.formatSize(up.total.size) + '），已上传' + up.total.uploaded + '张';
                if (up.total.failed) {
                    text += '，失败' + up.total.failed + '张,<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>图片';
                }
            } else {
                text = '选中' + up.files.length + '张图片，共' + plupload.formatSize(up.total.size) + '。';
            }
        }


        if (!up.files.length) {
            up.$uploadInfo.$infoText.html("");
        } else {

            up.$uploadInfo.$infoText.show().html(text);
        }

    }
    //获取queued 和failed的值
    $.fn.plupload = function(options) {
        var opt = $.extend(true, {}, $.fn.plupload.defaultConfig, options);

        return this.each(function(index, el) {

            opt.browse_button = el;
            var $this = $(this);
            var uploader = new plupload.Uploader(opt);




            uploader.$container = $this.parents(".coms-plupload-container").eq(0);
            uploader.$noFileDefault = uploader.$container.find(".coms-plupload-nofile");
            uploader.$choiceBtn = $this;
            uploader.$uploadUL = uploader.$container.find(".coms-upload-list"); //ul列表
            uploader.$btnStartload = uploader.$container.find(".btn-startload-file");
            uploader.$btnStopload = uploader.$container.find(".btn-stopload-file");


            if (!!opt.uploadInfo.required) {
                var $uploadInfoDetail = $('<div class="coms-upload-info"><div class="info-txt"></div><div class="info-progress"><span class="txt"></span><span class="percentage"></span></div></div>');
                if (opt.uploadInfo.container) {
                    uploader.$uploadInfo = uploader.$container.find(opt.uploadInfo.container);
                    $uploadInfoDetail.appendTo(uploader.$uploadInfo)
                } else {
                    $uploadInfoDetail.prependTo(uploader.$container);
                    uploader.$uploadInfo = $uploadInfoDetail;
                }


                uploader.$uploadInfo.$infoText = uploader.$uploadInfo.find(".info-txt");
                uploader.$uploadInfo.$progress = uploader.$uploadInfo.find(".info-progress");
                uploader.$uploadInfo.$progress.$txt = uploader.$uploadInfo.$progress.children(".txt");
                uploader.$uploadInfo.$progress.$percent = uploader.$uploadInfo.$progress.children(".percentage");
                $(document).on("click", ".coms-upload-info .retry", function(event) {
                    event.preventDefault();
                    for (var i = 0; i < uploader.files.length; i++) {
                        if (uploader.files[i].status == plupload.FAILED) {
                            uploader.files[i].status = plupload.QUEUED;
                        }
                    }
                    uploader.start();
                });

                $(document).on("click", ".coms-upload-info .ignore", function(event) {
                    event.preventDefault();
                    // console.dir("ignore 点击xxxxxxxxxxxxxx");
                    // console.dir(uploader.files);
                    for (var i = 0; i < uploader.files.length; i++) {
                        if (uploader.files[i].status == plupload.FAILED) {
                            uploader.removeFile(uploader.files[i]);
                            i--;
                        }
                    }
                    // console.dir(uploader.files);

                })

            }



            //多个文件上传按钮
            uploader.$btnStartload.on("click", function() {
                // console.dir("btnStartload点击事件");
                var $this = $(this);
                if ($this.hasClass('disabled')) return;
                // 编辑files 对于那些
                for (var i = 0; i < uploader.files.length; i++) {
                    if (uploader.files[i].status == plupload.FAILED) {
                        uploader.files[i].status = plupload.QUEUED;
                    }
                }
                // uploader.start();
                toggleStopUpload(uploader, "BeforeUpload");

            });

            uploader.$btnStopload.on("click", function() {
                // console.dir("btnStopload点击事件");
                uploader.stop();
                toggleStartUpload(uploader, "Pausing");
                toggleStopUpload(uploader, "Pausing");
            })



            uploader.bind("Init", function(uploader) {
                // console.group("Init事件:当Plupload初始化完成后触发监听函数参数：(uploader)");
                !!opt.initLoad && !!opt.initLoad(uploader);
            });

            uploader.bind("PostInit", function() {
                // console.group("PostInit事件:当Init事件发生后触发监听函数参数：(uploader)");
            });

            uploader.bind("Browse", function(up) {
                // console.group("Browse事件")
            });

            uploader.bind('FileFiltered', function(up, file) {
                // console.group("FileFiltered事件");

            });


            //这里的files是指每次添加的，而不是总的
            uploader.bind('FilesAdded', function(up, files) {
                // console.group("FilesAdded事件");
                plupload.each(files, function(file) {
                    var str = '<li id="' + file.id + '">' +
                        '<div class="img-wrap">' +
                        '<div class="preview-tip"><span>预览中...</span></div>' +
                        '<div class="preview-name"><span></span></div>' +
                        '<div class="preview-pic"></div>' +
                        '</div>' +
                        '<div class="handle-bar">' +
                        
                        '<span class="upbtn-del"></span>' +

                        '</div>' +
                        '<p class="progressing"><span style="width:0%;"></span></p>' +
                        '<span class="error">上传失败，请重试</span>' +

                        '<span class="upbtn-del-sl"></span>' +
                        '<span class="successing"></span>' +
                        '</li>';

                    file.$li = $(str);
                    if(opt.type==1){
                        file.$li.appendTo(up.$uploadUL);
                    }else if(opt.type==2){
                        if(!!uploader.$choiceBtn.data("single")){
                            $ul=$('<ul class="coms-upload-list clearfix"></ul>')
                            file.$li.appendTo($ul);
                           
                            $ul.appendTo(uploader.$choiceBtn.parents().siblings(".coms-plupload-container"));
                        }else{
                            file.$li.insertBefore(up.$choiceBtn.parents("li"));
                        }
                        
                    }
                    

                    file.$img = file.$li.find(".uploadimg");
                    file.$previewPic = file.$li.find(".preview-pic");
                    file.$previewTip = file.$li.find(".preview-tip");
                    file.$previewName = file.$li.find(".preview-name");
                    file.$handerBar = file.$li.find(".handle-bar");
                    file.$delQueuedBtn = file.$handerBar.find(".upbtn-del");
                    file.$uploadQueuedBtn = file.$handerBar.find(".upbtn-upload");

                    file.$progress = file.$li.find(".progressing");
                    file.$success = file.$li.find(".successing");
                    file.$error = file.$li.find(".error");

                    file.$delUploadSLBtn = file.$li.find(".upbtn-del-sl");
                    




                    preloadThumb(file, file.$previewPic, function(type) {
                        file.$previewTip.hide();
                        if (type == "error") {
                            file.$previewName.show().children().html('暂不支持该文件预览<br/>' + file.name);
                        } else {
                            file.$previewPic.show();
                        }
                    }, uploader);

                    toggleHanderBar(up, file, "FilesAdded");
                    //判断如果
                    //删除按钮(队列)
                    file.$delQueuedBtn.on("click", function() {
                        up.removeFile(file);
                    });


                    //单个文件上传按钮
                    file.$uploadQueuedBtn.on("click", function() {
                        // console.dir("uploadQueuedBtn点击事件")
                        var $this = $(this);
                        // console.dir(file);
                        if ($this.hasClass('retry-btn')) {
                            file.status = plupload.QUEUED;
                        }
                        // console.dir(up.total)
                        up.start();
                    });

                    file.$delUploadSLBtn.on("click",function(){
                        up.removeFile(file);
                    });
                    //第二种类型的时候直接上传
                    opt.type==2 &&  up.start();
                    

                });



            });


            uploader.bind('QueueChanged', function(up) {
                // console.group("QueueChanged事件");
                //FilesAdded事件和FilesRemoved事件也会触发这个事件
                
            });

            //控制打的按钮就要在这个地方，例如重新上传 就会触犯这个函数
            uploader.bind('StateChanged', function(up) {
                //暂时不知道这个的作用

                //执行两次，一个是开始上传的时候
                //然后是上传后FileUploaded 后执行 或者是在Error事件后执行StateChanged，但是两次的执行竟然up.total是一样的
                // console.group("StateChanged事件");
                // console.dir(up.total);


            });


            //如果上传失败，那么我删除了文件，那么自然会触犯StateChanged 事件，但是在这个事件里面 失败的文件仍然是1
            //但是到refresh的时候，这个failed 就变成了0，所以toggleStartUpload 为什么放这里而不放StateChanged

            uploader.bind('Refresh', function(up) {
                // console.group("Refresh事件");

                //QueueChanged都会触发refresh函数，如果有上传的获取是有队列的时候,那么默认的图片就应该隐藏
                if (up.total.uploaded || up.total.failed || (up.files.length - (up.total.uploaded + up.total.failed)) > 0) {
                    up.$noFileDefault.hide();
                } else {
                    up.$noFileDefault.show();
                }
                toggleStartUpload(up, "Refresh");
                toggleBrowseButton(up);
                toggleUploadInfo(up);
                up.settings.toggleSubmitButton &&  up.settings.toggleSubmitButton.call(up);


                


            });



            uploader.bind('BeforeUpload', function(up, file) {
                // console.group("BeforeUpload事件");
                file.$progress.show();
                file.$error.hide();
                toggleHanderBar(up, file, "BeforeUpload");
                toggleStopUpload(up, "BeforeUpload");
                toggleStartUpload(up, "BeforeUpload");
                toggleUploadInfo(up, "BeforeUpload")



            });

            uploader.bind('UploadFile', function(up, file) {
                // console.group("UploadFile事件");
            });






            uploader.bind('UploadProgress', function(up, file) {
                // console.group("UploadProgress事件");
                // console.dir(file)

                file.$progress.children().css("width", file.percent + "%");
                toggleUploadInfo(up, "UploadProgress");
            });

            uploader.bind('ChunkUploaded', function(up, file, info) {
                // console.group("ChunkUploaded事件")
            });

            //文件上传成功才会触发
            uploader.bind('FileUploaded', function(up, file, info) {
                // console.group("FileUploaded事件");
                
                var response = $.parseJSON(info.response);
                // console.dir(response);
                // console.dir(up.total);
                //服务器上传成功
                if (!!response.code && response.code == 1) {
                    toggleDelUploadSLBtn(up, file, "FileUploadedSuccess");
                    file.$success.show();
                    file.$progress.hide().children().css("width", 0);
                    toggleHanderBar(up, file, "FileUploadedSuccess");
                    !!opt.fileUploaded && opt.fileUploaded.call(up, file, response)

                } else {
                    //服务器上传失败

                    file.status = plupload.FAILED;
                    file.$error.show();
                    file.$progress.hide().children().css("width", 0);
                    toggleHanderBar(up, file, "FileUploadedFail");
                }

            });




            //固定会触发的
            uploader.bind('UploadComplete', function(up, files) {
                // console.group("UploadComplete事件");
                toggleStartUpload(up, "UploadComplete");
                toggleStopUpload(up, "UploadComplete");
                toggleUploadInfo(up, "UploadComplete");
                $.each(files, function(index, file) {
                    file.$progress.hide().children().css('width', 0);
                    if (file.status == plupload.DONE) {
                        file.$success.show();
                        toggleDelUploadSLBtn(up, file, "FileUploadedSuccess");
                        file.$error.hide();
                    } else if (file.status == plupload.FAILED) {
                        //失败的时候
                        file.$uploadQueuedBtn.addClass('retry-btn');
                        file.$error.show();
                        toggleHanderBar(up, file, "UploadComplete");
                    }
                });
                !!opt.uploadComplete && opt.uploadComplete.call(up, files);




            });


            uploader.bind('FilesRemoved', function(up, files) {
                // console.group("FilesRemoved事件");
                $.each(files, function(index, file) {
                    file.$li.remove();
                    !!opt.fileRemoved && opt.fileRemoved.call(up,file)
                });

               //在这里files 依然是存在的

            });


            uploader.bind('Destroy', function() {
                // console.group("Destroy事件")
            });

            uploader.bind('OptionChanged', function(up, name, value, oldValue) {
                // console.group("OptionChanged事件");

            });



            uploader.bind('Error', function(up, err) {
                // console.group("Error事件");
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

                    case plupload.FILE_COUNT_ERROR:
                        details = "最多只能上传" + (up.getOption('filters').max_file_count || 0) + "个文件";
                        break;

                    case plupload.IMAGE_FORMAT_ERROR:
                        details = _("图片格式错误或者不支持");
                        break;

                    case plupload.IMAGE_MEMORY_ERROR:
                        details = _("运行时已消耗所有可用内存。.");
                        break;


                }

               
                // layer.msg(details);

            });







            uploader.init();
            this.uploader = uploader;



        });


    }

    $.fn.plupload.defaultConfig = {
        runtimes: 'html5,flash,silverlight,html4',
        browse_button: 'J_pickfiles', // you can pass an id...
        url: './php/upload.php',
        delUrl: './php/delfile.php',
        flash_swf_url: './js/plupload/Moxie.swf',
        silverlight_xap_url: './js/plupload/Moxie.xap',
        chunk_size: 0,
        max_retries: 0,
        multi_selection: true,
        multipart_params: {},
        delSLBtn:true,
        isBrowseEndShow:false,
        type:1,
        uploadInfo: {
            required: true,
            container: false
        },
        
        filters: {
            max_file_count: 3,
            prevent_duplicates: true,
            max_file_size: '30mb',
            // mime_types: [
            //     { title: "Image files", extensions: "jpeg,jpg,gif,png" },
            //     { title: "Zip files", extensions: "zip" }
            // ]
        },
        resize: {
            // width: 100,
            // height: 100,
            // //是否裁剪图片
            // crop: true,
            //压缩后图片的质量，只对jpg格式的图片有效，默认为90。quality可以跟width和height一起使用，但也可以单独使用，单独使用时，压缩后图片的宽高不会变化，但由于质量降低了，所以体积也会变小
            quality: 60,
            //压缩后是否保留图片的元数据，true为保留，false为不保留,默认为true。删除图片的元数据能使图片的体积减小一点点
            preserve_headers: false
        }
    }




})(window.Zepto || window.jQuery, plupload);