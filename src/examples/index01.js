   

   var uploader = new plupload.Uploader({
       runtimes: 'html5,flash,silverlight,html4',
       browse_button: 'img-add-btn-1', // you can pass an id...
       url: 'https://wnworld.com/api/plupload/upload.php',
       flash_swf_url: '../js/Moxie.swf',
       silverlight_xap_url: '../js/Moxie.xap',
       filters: {
           prevent_duplicates: true,
           max_file_size: '10mb',
           mime_types: [
               { title: "Image files", extensions: "jpg,gif,png,psd" },
               { title: "Zip files", extensions: "zip" }
           ]
       }
   });





   uploader.bind("Init", function(uploader) {
       console.group("Init事件:当Plupload初始化完成后触发监听函数参数：(uploader)");
   });

   uploader.bind("PostInit", function() {
       console.group("PostInit事件:当Init事件发生后触发监听函数参数：(uploader)");
       $(".img-upload-btn").on("click", function() {
           uploader.start();
       });
   });

   uploader.bind("Browse", function(up) {
       console.group("Browse事件")
   });



   uploader.bind('FileFiltered', function(up, file) {
       console.group("FileFiltered事件")
   });




   function preloadThumb(file, cb) {
       var img = new moxie.image.Image();
       var resolveUrl = moxie.core.utils.Url.resolveUrl;
       img.onload = function() {
           var thumb = $('#' + file.id);
           this.embed(thumb[0], {
               // width: self.options.thumb_width,
               // height: self.options.thumb_height,
               width: 110,
               height: 110,
               crop: true,
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




   uploader.bind('FilesAdded', function(up, files) {
       console.group("FilesAdded事件");
       console.dir(files);
       $(".img-upload-btn").removeClass("disabled");

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
           $str.appendTo($('.wangeditor-uploadfile-list'));
           $beforePreview = $str.find('.img-before-preview');
           $afterPreview = $str.find(".img-after-preview");
           $del=$str.find(".img-del-btn");

           $del.show();
           $del.on("click",function(){
                uploader.removeFile(file);
                console.dir(uploader.files);



           })
            console.dir(uploader.files);
            console.dir(uploader.total);
           preloadThumb(file, function(type) {
                $beforePreview.hide();


           })
       });
   });





   uploader.bind('QueueChanged', function(up) {
       console.group("QueueChanged事件")
   });

   uploader.bind('Refresh', function(up) {
       console.group("Refresh事件")
   });




   uploader.bind('BeforeUpload', function(up, file) {
       console.group("BeforeUpload事件");
       //
       var $li = $("#" + file.id);
       var $propress = $li.find(".img-progress").show();
   });
   uploader.bind('UploadProgress', function(up, file) {
       console.group("UploadProgress事件");
       console.dir(file);
       var $li = $("#" + file.id);
       var $propress = $li.find(".img-progress").show();
       $propress.children('span').css("width", file.percent + "%");
   });




   uploader.bind('FileUploaded', function(up, file, info) {
       console.group("FileUploaded事件")
   });

   uploader.bind('StateChanged', function(up) {
       //当前的上传状态，可能的值为plupload.STARTED或plupload.STOPPED，该值由Plupload实例的stop()或statr()方法控制。默认为plupload.STOPPED
       console.group("StateChanged事件");
       console.dir(up.state);
   });

   uploader.bind('UploadComplete', function(up, files) {
       console.group("UploadComplete事件")
   });






   uploader.bind('FilesRemoved', function(up, files) {
       console.group("FilesRemoved事件")
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















   uploader.init();