<?php
// 例：
// 短网址接口为：https://url.xxx.cn/api.php?url=

// 成功时返回格式为：
// {
//     code: 0, // 状态码
//     data: {
//         long_url: 'https://qr.xxx.cn/allqr.html?xxxxxxxxxxxxx', // 原长网址
//         short_url: 'https://url.xxx.cn/xxxxx' // 生成的短网址
//     }
// }


if ($_GET['url_long']) {
    $url_long = $_GET['url_long'];
} else {
    echo "Longurl can not be empty.";
    return;
}

$api = "https://url.xxx.cn/api.php?url="; // 此处填写短网址接口

// 请求地址
$url = $api . $url_long;

$res = json_decode(file_get_contents($url), true);
if($res["code"] == 0) { // 此处填写生成成功时接口返回状态值和状态码
    $tinyurl = $res["data"]["short_url"];  // 此处填写短网址所在的路径
} else {
    $tinyurl = $url_long; // 生成失败则默认使用原来的长网址
}

echo $tinyurl;