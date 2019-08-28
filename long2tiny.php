<?php

if ($_GET['url_long']) {
    $url_long = $_GET['url_long'];
} else {
    echo "Longurl can not be empty.";
    return;
}

// 短网址api接口
// 腾讯 http://sa.sogou.com/gettiny?url= 推荐用这个，
// 新浪 https://api.t.sina.com.cn/short_url/shorten.json?source=2849184197&url_long=
$api = "http://sa.sogou.com/gettiny?url=";

// 请求地址
$url = $api . $url_long;   

if ($api == "http://sa.sogou.com/gettiny?url=") {
    $tinyurl = file_get_contents($url);
} else if($api == "https://api.t.sina.com.cn/short_url/shorten.json?source=2849184197&url_long=") {
    $res = json_decode(file_get_contents($url), true);
    $tinyurl = str_replace("http", "https", $res[0]["url_short"]);
} else {
    $tinyurl = "Api error.";
}

 echo $tinyurl;

;
?>