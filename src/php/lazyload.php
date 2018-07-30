<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header('Access-Control-Allow-Headers:x-requested-with,content-type');
$galleryid = $_POST["galleryid"];
$arr = array();
if ($galleryid == 1 || !$galleryid) {
    $arr = array("list" => array(
        "http://wnworld.com/Mine/common/images/pic01.jpg",
        "http://wnworld.com/Mine/common/images/pic02.jpg",
        "http://wnworld.com/Mine/common/images/pic03.jpg",
        "http://wnworld.com/Mine/common/images/pic04.jpg",
        "http://wnworld.com/Mine/common/images/pic05.jpg",
        "http://wnworld.com/Mine/common/images/pic06.jpg",
        "http://wnworld.com/Mine/common/images/pic07.jpg",
        "http://wnworld.com/Mine/common/images/pic08.jpg",
        "http://wnworld.com/Mine/common/images/pic09.jpg",
        "http://wnworld.com/Mine/common/images/pic10.jpg",
        "http://wnworld.com/Mine/common/images/pic11.jpg",
        "http://wnworld.com/Mine/common/images/pic12.jpg",
        "http://wnworld.com/Mine/common/images/pic13.jpg",
        "http://wnworld.com/Mine/common/images/pic14.jpg",
        "http://wnworld.com/Mine/common/images/pic15.jpg",
        "http://wnworld.com/Mine/common/images/pic16.jpg",
        "http://wnworld.com/Mine/common/images/pic17.jpg",
        "http://wnworld.com/Mine/common/images/pic18.jpg",
        "http://wnworld.com/Mine/common/images/pic19.jpg",
        "http://wnworld.com/Mine/common/images/pic20.jpg",
    ),
    );
} elseif ($galleryid == 2) {
    $arr = array(
        "list" => array(
            "http://wnworld.com/Mine/common/images/pic21.jpg",
            "http://wnworld.com/Mine/common/images/pic22.jpg",
            "http://wnworld.com/Mine/common/images/pic23.jpg",
        ),
    );
} elseif ($galleryid == 3) {
    $arr = array(
        "list" => array(
            "http://wnworld.com/Mine/common/images/pic25.jpg",
            "http://wnworld.com/Mine/common/images/pic26.jpg",
            "http://wnworld.com/Mine/common/images/pic27.jpg",
        ),
    );
}

echo json_encode($arr);
?>