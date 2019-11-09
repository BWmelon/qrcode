<?php

if ($_GET['url_long']) {
    $url_long = $_GET['url_long'];
} else {
    echo "Longurl can not be empty.";
    return;
}

// 短网址api接口
// 第三方生成腾讯 2019/11/09 更新 http://dwz.fxw.la/url/url.php?
// 腾讯 http://sa.sogou.com/gettiny?url= (已失效)
// 新浪 https://api.t.sina.com.cn/short_url/shorten.json?source=2849184197&url_long= (已失效)

$api = "http://dwz.fxw.la/url/url.php?";

// 请求地址
$url = $api . $url_long;   

// if ($api == "http://sa.sogou.com/gettiny?url=") {
//     $tinyurl = file_get_contents($url);
// } else if($api == "https://api.t.sina.com.cn/short_url/shorten.json?source=2849184197&url_long=") {
//     $res = json_decode(file_get_contents($url), true);
//     $tinyurl = str_replace("http", "https", $res[0]["url_short"]);
// } else {
//     $tinyurl = "Api error.";
// }

if($api == "http://dwz.fxw.la/url/url.php?") {
    $res = json_decode(file_get_contents($url), true);
    $tinyurl = str_replace("http", "https", $res["url_short"]);
}

echo $tinyurl;

?>