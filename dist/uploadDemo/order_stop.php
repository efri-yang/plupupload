<?php
for ($i = 0; $i < 5000000; $i++) {
    $jy = 10;
}

$rand = mt_rand(0, 1);

if ($rand) {
    die(json_encode(array(
        'OK' => 1,
    )));
} else {
    die(json_encode(array(
        'OK' => 0,
        'error' => array(
            'code' => 301,
            'message' => "添加失败！",
        ),
    )));
}
?>