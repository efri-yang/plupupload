<?php
$fileUrl = $_POST["imgurl"];
$targetDir = $_SERVER["DOCUMENT_ROOT"] . $fileUrl;
if (unlink($targetDir)) {
    echo 1;
} else {
    echo 0;
}
?>