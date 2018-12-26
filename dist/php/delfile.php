<?php
$fileUrl = $_POST["imgurl"];
$targetDir = $fileUrl;
if (unlink($targetDir)) {
    echo 1;
} else {
    echo 0;
}
?>