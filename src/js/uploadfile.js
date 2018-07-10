plupload.addFileFilter('max_file_count', function(maxFileCount, file, cb) {
    if (maxFileCount <= uploader.files.length - (uploader.total.uploaded + uploader.total.failed)) {
        //抛出上传个数限制
        uploader.trigger('error',{
            code :-9001,
            file : file
        })
        cb(false);
    } else {
        cb(true);
    }
});

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
        max_file_count: 2, //单次上传最大的文件数量
        prevent_duplicates: true,
        max_file_size: '3mb',
        mime_types: [
            { title: "Image files", extensions: "jpg,gif,png,psd" },
            { title: "Zip files", extensions: "zip" }
        ]
    }
});






var $container=$("#J_coms-plupload-1");
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
uploader.bind('FilesAdded', function(up, files) {
    console.group("FilesAdded事件");
    up.start();
});

uploader.bind('StateChanged', function(up) {
    console.group("StateChanged事件");
});

uploader.bind('BeforeUpload', function(up, file) {
    console.group("BeforeUpload事件");
});
uploader.bind('UploadFile', function(up, file) {
    console.group("UploadFile事件");
});

uploader.bind('QueueChanged', function(up) {
    console.group("QueueChanged事件");
});
uploader.bind('Refresh', function(up) {
    console.group("Refresh事件");
});




uploader.bind('UploadProgress', function(up, file) {
    console.group("UploadProgress事件");
});

uploader.bind('ChunkUploaded', function(up, file, info) {
    console.group("ChunkUploaded事件")
});


uploader.bind('FileUploaded', function(up, file, info) {
    console.group("FileUploaded事件");
});


uploader.bind('Error', function(up, err) {
    console.group("Error事件")
})



uploader.bind('UploadComplete', function(up, files) {
    console.group("UploadComplete事件");
});






uploader.bind('FilesRemoved', function(up, files) {
    console.group("FilesRemoved事件");
});

uploader.bind('Destroy', function() {
    console.group("Destroy事件")
});

uploader.bind('OptionChanged', function(up, name, value, oldValue) {
    console.group("OptionChanged事件")
});





uploader.init();





