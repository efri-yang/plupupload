<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header('Access-Control-Allow-Headers:x-requested-with,content-type');

$arr = array("list" => array(
    array("id" => 1, "text" => "默认相册"),
    array("id" => 2, "text" => "我的旅行"),
    array("id" => 3, "text" => "测试相册测试相册"),
),
);
echo json_encode($arr);
?>