(function($, plupload) {
    plupload.FILE_COUNT_ERROR = -9001;
    plupload.addFileFilter("max_file_count", function(maxFileCount, file, cb) {
        console.group('max_file_count事件');
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
        } else {
            up.disableBrowse(false);
            up.$choiceBtn.removeClass("disabled");
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

    function toggleInsertBtn(up) {
        if (up.$uploadUL.children().hasClass('selected')) {
            up.$insertBtnLocal.removeClass('disabled')
        } else {
            up.$insertBtnLocal.addClass('disabled')
        }
    }


    function toggleUploadInfo(up, eventing) {

        if (!up.settings.hasUploadInfo || !up.$uploadInfo.length) return;

        var text = '';
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
            if (up.total.uploaded) {
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


            uploader.$container = $this.parents(".ckeditor-imgupload-dialog").eq(0);
            uploader.$noFileDefault = uploader.$container.find(".ckeditor-uploadfile-no");
            uploader.$choiceBtn = $this;
            uploader.$uploadUL = uploader.$container.find(".ckeditor-uploadfile-list"); //ul列表
            uploader.$btnStartload = uploader.$container.find(".img-upload-btn");
            uploader.$btnStopload = uploader.$container.find(".img-pause-btn");

            //本地上传的插入按钮和相册插入按钮
            uploader.$insertBtnLocal = uploader.$container.find(".ft-btn-insert");
            uploader.$insertBtnServer = uploader.$container.find(".ft-galleryall-insert");
            uploader.$galleryList = uploader.$container.find(".ckeditor-gallery-list")

            if (!!opt.hasUploadInfo) {
                uploader.$uploadInfo = uploader.$container.find(".img-upload-info");
                if (uploader.$uploadInfo.length) {
                    uploader.$uploadInfo.$infoText = uploader.$uploadInfo.find(".info-txt");
                    uploader.$uploadInfo.$progress = uploader.$uploadInfo.find(".info-progress");
                    uploader.$uploadInfo.$progress.$txt = uploader.$uploadInfo.$progress.children(".txt");
                    uploader.$uploadInfo.$progress.$percent = uploader.$uploadInfo.$progress.children(".percentage");
                    $(document).on("click", ".img-upload-info .retry", function(event) {
                        event.preventDefault();
                        for (var i = 0; i < uploader.files.length; i++) {
                            if (uploader.files[i].status == plupload.FAILED) {
                                uploader.files[i].status = plupload.QUEUED;
                            }
                        }
                        uploader.start();
                    });

                    $(document).on("click", ".img-upload-info .ignore", function(event) {
                        event.preventDefault();
                        console.dir("ignore 点击xxxxxxxxxxxxxx");
                        console.dir(uploader.files);

                        for (var i = 0; i < uploader.files.length; i++) {
                            if (uploader.files[i].status == plupload.FAILED) {
                                uploader.removeFile(uploader.files[i]);
                                i--;
                            }
                        }
                        console.dir(uploader.files);

                    })
                }
            }

            uploader.$uploadUL.on("click", "li", function() {
                var $this = $(this);
                if ($this.hasClass('selected')) {
                    $this.removeClass('selected');
                } else {
                    $this.addClass('selected');
                }
                toggleInsertBtn(uploader);
            })

            uploader.$insertBtnLocal.on("click", function() {
                var $this = $(this);
                if ($this.hasClass('disabled')) return;
                //插入编辑器
                alert("插入编辑器");
            });

            uploader.$insertBtnServer.on("click", function() {
                var $this = $(this);
                if ($this.hasClass('disabled')) return;
                //插入编辑器
                alert("插入编辑器");
            });

            //相册中选择  插入按钮
            uploader.$galleryList.on("click", "li", function(e) {
                e.preventDefault();
                var $this = $(this);
                if ($this.hasClass('selected')) {
                    $this.removeClass('selected')
                } else {
                    $this.addClass('selected');
                }
                if (uploader.$galleryList.children().hasClass('selected')) {
                    uploader.$insertBtnServer.removeClass('disabled')
                } else {
                    uploader.$insertBtnServer.addClass('disabled')
                }
            });


            //标签显示的时候

            $('a[href="#tabbd-gallery-container"]').on('shown.bs.tab', function(e) {
                $.ajax({
                    url: './php/lazyload.php',
                    type: 'get',
                    dataType: 'json',
                    data: {param1: 'value1'},
                    success:function(res){
                         var strArr = [];
                        $.each(res.list, function(index, src) {
                            strArr.push('<li data-src="' + src + '"><div class="pic"><img src="' + src + '" /></div><span class="status-check"></span></li>');
                        });
                        uploader.$galleryList.html(strArr.join(""));
                        
                    }
                })
            });







            //多个文件上传按钮
            uploader.$btnStartload.on("click", function() {
                console.dir("btnStartload点击事件");
                var $this = $(this);
                if ($this.hasClass('disabled')) return;
                // 编辑files 对于那些
                for (var i = 0; i < uploader.files.length; i++) {
                    if (uploader.files[i].status == plupload.FAILED) {
                        uploader.files[i].status = plupload.QUEUED;
                    }
                }
                uploader.start();
                toggleStopUpload(uploader, "BeforeUpload");

            });

            uploader.$btnStopload.on("click", function() {
                console.dir("btnStopload点击事件");
                uploader.stop();
                toggleStartUpload(uploader, "Pausing");
                toggleStopUpload(uploader, "Pausing");
            });







            uploader.bind("Init", function(uploader) {
                console.group("Init事件:当Plupload初始化完成后触发监听函数参数：(uploader)");
                !!opt.initLoad && !!opt.initLoad(uploader);
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


            //这里的files是指每次添加的，而不是总的
            uploader.bind('FilesAdded', function(up, files) {
                console.group("FilesAdded事件");
                plupload.each(files, function(file) {

                    var str = '<li id="' + file.id + '">' +
                        '<div class="img-wrap preview">' +
                        '<div class="preview-tip"><span>预览中...</span></div>' +
                        '<div class="preview-name"><span>2018-2018-2018-2018-04-05.zip</span></div>' +
                        '<div class="preview-pic"><img src="images/demo/01.jpg" class="uploadimg" /></div>' +
                        '<div class="handle-bar"><span class="upbtn-del">删除</span></div>' +
                        '<p class="progressing"><span style="width:0%;"></span></p>' +
                        '<span class="error">上传失败，请重试</span>' +
                        '<span class="successing"></span>' +
                        '</div>' +
                        (opt.inputHidden ? '<input type="hidden" id="' + file.id + '" name="' + opt.inputHidden.name + '">' : '') +
                        '</li>';

                    file.$li = $(str);
                    file.$li.appendTo(up.$uploadUL);

                    file.$img = file.$li.find(".uploadimg");
                    file.$previewPic = file.$li.find(".preview-pic");
                    file.$previewTip = file.$li.find(".preview-tip");
                    file.$previewName = file.$li.find(".preview-name");
                    file.$handerBar = file.$li.find(".handle-bar");
                    file.$delQueuedBtn = file.$handerBar.find(".upbtn-del");

                    file.$progress = file.$li.find(".progressing");
                    file.$success = file.$li.find(".successing");
                    file.$error = file.$li.find(".error");

                    file.$delUploadServerBtn = file.$li.find(".upbtn-del-server");
                    file.$inputHidden = file.$li.find('input[name="' + opt.inputHidden.name + '"]');




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



                    if (up.settings.delServerBtn) {
                        //删除服务端文件
                        file.$delUploadServerBtn.on("click", function() {

                            $.ajax({
                                url: uploader.settings.delUrl,
                                type: "post",
                                data: { uid: uploader.settings.multipart_params.uid, imgurl: file.serverUrl },
                                dataType: "json",
                                success: function(data) {
                                    if (data) {
                                        //删除成功 删除队列的文件，如果我们规定只能上传一个文件，或者三个文件那么就要判断
                                        uploader.removeFile(file);

                                    } else {
                                        layer.msg("删除失败！")
                                    }
                                }
                            })
                        })
                    }

                });



            });


            uploader.bind('QueueChanged', function(up) {
                console.group("QueueChanged事件");
                //filter判断一次 这里要在判断一次，因为files上传和删除的时候都会触发这个事件
            });

            //控制打的按钮就要在这个地方，例如重新上传 就会触犯这个函数
            uploader.bind('StateChanged', function(up) {
                //暂时不知道这个的作用

                //执行两次，一个是开始上传的时候
                //然后是上传后FileUploaded 后执行 或者是在Error事件后执行StateChanged，但是两次的执行竟然up.total是一样的
                console.group("StateChanged事件");
                console.dir(up.total);


            });


            //如果上传失败，那么我删除了文件，那么自然会触犯StateChanged 事件，但是在这个事件里面 失败的文件仍然是1
            //但是到refresh的时候，这个failed 就变成了0，所以toggleStartUpload 为什么放这里而不放StateChanged

            uploader.bind('Refresh', function(up) {
                console.group("Refresh事件");
                //QueueChanged都会触发refresh函数，如果有上传的获取是有队列的时候,那么默认的图片就应该隐藏
                if (up.total.uploaded || up.total.failed || (up.files.length - (up.total.uploaded + up.total.failed)) > 0) {
                    up.$noFileDefault.hide();
                } else {
                    up.$noFileDefault.show();
                }
                toggleStartUpload(up, "Refresh");
                toggleBrowseButton(up);
                toggleUploadInfo(up);
            });



            uploader.bind('BeforeUpload', function(up, file) {
                console.group("BeforeUpload事件");
                file.$progress.show();
                file.$error.hide();
                toggleHanderBar(up, file, "BeforeUpload");
                toggleStopUpload(up, "BeforeUpload");
                toggleStartUpload(up, "BeforeUpload");
                toggleUploadInfo(up, "BeforeUpload")



            });

            uploader.bind('UploadFile', function(up, file) {
                console.group("UploadFile事件");
            });






            uploader.bind('UploadProgress', function(up, file) {
                console.group("UploadProgress事件");
                console.dir(file)

                file.$progress.children().css("width", file.percent + "%");
                toggleUploadInfo(up, "UploadProgress");
            });

            uploader.bind('ChunkUploaded', function(up, file, info) {
                console.group("ChunkUploaded事件")
            });

            //文件上传成功才会触发
            uploader.bind('FileUploaded', function(up, file, info) {
                console.group("FileUploaded事件");
                console.dir(info);
                var response = $.parseJSON(info.response);
                console.dir(response);
                console.dir(up.total);
                //服务器上传成功
                if (!!response.OK && response.OK == 1) {
                    file.serverUrl = response.info.path;
                    file.$li.addClass('selected').attr("data-src", response.info.path);
                    file.$success.show();
                    file.$progress.hide().children().css("width", 0);
                    toggleHanderBar(up, file, "FileUploadedSuccess");
                    !!file.$inputHidden.length && file.$inputHidden.val(response.info.path);
                    !!opt.fileUploaded && opt.fileUploaded(up, file)
                    toggleInsertBtn(up);
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
                console.group("UploadComplete事件");
                toggleStartUpload(up, "UploadComplete");
                toggleStopUpload(up, "UploadComplete");
                toggleUploadInfo(up, "UploadComplete");
                $.each(files, function(index, file) {
                    file.$progress.hide().children().css('width', 0);
                    if (file.status == plupload.DONE) {
                        file.$success.show();

                        file.$error.hide();
                    } else if (file.status == plupload.FAILED) {
                        //失败的时候

                        file.$error.show();
                        toggleHanderBar(up, file, "UploadComplete");
                    }
                });
                !!opt.uploadComplete && opt.uploadComplete.call(up, files);




            });


            uploader.bind('FilesRemoved', function(up, files) {
                console.group("FilesRemoved事件");
                $.each(files, function(index, file) {
                    file.$li.remove();
                })

            });


            uploader.bind('Destroy', function() {
                console.group("Destroy事件")
            });

            uploader.bind('OptionChanged', function(up, name, value, oldValue) {
                console.group("OptionChanged事件");
                console.dir(up);
            });



            uploader.bind('Error', function(up, err) {
                console.group("Error事件");
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
                        details = _("Image format either wrong or not supported.");
                        break;

                    case plupload.IMAGE_MEMORY_ERROR:
                        details = _("Runtime ran out of available memory.");
                        break;


                }


                layer.msg(details);

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
        delServerBtn: true,
        hasUploadInfo: true,
        inputHidden: {
            name: "photo_url[]"
        },
        filters: {
            max_file_count: 3,
            prevent_duplicates: true,
            max_file_size: '30mb',
            mime_types: [
                { title: "Image files", extensions: "jpg,gif,png" },
                { title: "Zip files", extensions: "zip" }
            ]
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




})(jQuery, plupload);