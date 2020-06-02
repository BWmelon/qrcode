<?php

if ($_GET['url_long']) {
    $url_long = $_GET['url_long'];
} else {
    echo "Longurl can not be empty.";
    return;
}

// 短网址文档（源于网络） https://api.gogoy.cn/doc/dwz.html
$api = "https://api.gogoy.cn/api/dwz?type=urlcn&url=";

// 请求地址
$url = $api . $url_long;

if($api == "https://api.gogoy.cn/api/dwz?type=urlcn&url=") {
    $res = json_decode(file_get_contents($url), true);
    if($res["code"] == 0) {
        $tinyurl = $res["data"]["short_url"];
    } else {
        $tinyurl = 'Short URL generation failed, the reason is: ' . $res["msg"];    
    }
}

echo $tinyurl;