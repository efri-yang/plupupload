<?php

require_once "PluploadHandler.php";

$ph = new PluploadHandler(array(
    'target_dir' => $_SERVER["DOCUMENT_ROOT"] . DIRECTORY_SEPARATOR . "plupupload" . DIRECTORY_SEPARATOR . "src" . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . date("Ymd"),
    // 'target_dir' => "../uploads/ss",
    'allow_extensions' => 'jpg,jpeg,png,zip',
));

$ph->sendNoCacheHeaders();
$ph->sendCORSHeaders();

if ($result = $ph->handleUpload()) {
    die(json_encode(array(
        'OK' => 1,
        'info' => $result,
    )));
} else {
    die(json_encode(array(
        'OK' => 0,
        'error' => array(
            'code' => $ph->getErrorCode(),
            'message' => $ph->getErrorMessage(),
        ),
    )));
}