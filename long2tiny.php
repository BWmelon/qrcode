<?php

if ($_GET['url_long']) {
    $url_long = $_GET['url_long'];
} else {
    echo "Longurl can not be empty.";
    return;
}

// 短网址api接口
// 第三方(优启梦API)生成腾讯 2019/11/14 更新 https://api.uomg.com/api/long2dwz?dwzapi=urlcn&url=?
// 腾讯 http://sa.sogou.com/gettiny?url= (已失效)
// 新浪 https://api.t.sina.com.cn/short_url/shorten.json?source=2849184197&url_long= (已失效)

$api = "https://api.uomg.com/api/long2dwz?dwzapi=urlcn&url=";

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

if($api == "https://api.uomg.com/api/long2dwz?dwzapi=urlcn&url=") {
    $res = json_decode(file_get_contents($url), true);
    if($res["code"] == 1) {
        $tinyurl = $res["ae_url"];
    } else {
        $tinyurl = '二维码生成失败';    
    }
    
}

echo $tinyurl;

?>