<?php

require_once "PluploadHandler.php";

$ph = new PluploadHandler(array(
    'target_dir' => DIRECTORY_SEPARATOR . "plupupload" . DIRECTORY_SEPARATOR . "src" . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . date("Ymd"),
    // 'target_dir' => "../uploads/ss",
    'allow_extensions' => 'jpg,jpeg,png,zip',
));

$ph->sendNoCacheHeaders();
$ph->sendCORSHeaders();

if ($result = $ph->handleUpload()) {

    die(json_encode(array(
        'status' => 200,
        'data' => $result,
    )));
} else {
    die(json_encode(array(
        'status' => 0,
        'data' => array(
            'code' => $ph->getErrorCode(),
            'message' => $ph->getErrorMessage(),
        ),
    )));
}