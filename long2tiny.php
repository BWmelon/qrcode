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

// 随机六位参数
function randomkeys($length)
{
	$pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';
	for($i=0;$i<$length;$i++) 
	{
		$key .= $pattern{mt_rand(0,35)}; //生成随机数
	}
	return $key; 
}

// 请求地址
//$url = $api . $url_long;
$url = $api . $url_long . '?' .randomkeys(6) . 'rxf.js';
// QQ的玄学拦截，调用数据/脚本资源等等不会被拦截（即使主域名已红）
// 所以在不调用的情况下'?'不会影响加载。
// 最不济QQ也只能拦截这个单页，不影响别的，比如他拦截了123456.js，不影响456789.js
// 个人猜测初衷应该是为了让那些调用css/js资源的网站能够正常加载
// 例如你调用了在线的bootstrap、jQ框架等，如果被拦截则会导致很多网站错误
// 上述注释内容语言表述应该有很多错误，你懂我意思就好
// 网站小透明，啥都不会，另外如果对这个拦截规则有什么专业的了解，请指教一二，QQ892923456
// 如果有大佬用这个思路开发除了防洪，我想白嫖一份，哈哈哈哈哈

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