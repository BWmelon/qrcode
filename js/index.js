console.log("%c", "padding:50px 300px;line-height:120px;background:url('http://5b0988e595225.cdn.sohucs.com/images/20181014/000c8b57362f4391af0d5f48a18ad638.gif') repeat;");
console.log("%c%c博客名称%c大西瓜博客", "line-height:28px;", "line-height:28px;padding:4px;background:#222;color:#fff;font-size:16px;margin-right:15px", "color:#3fa9f5;line-height:28px;font-size:16px;");
console.log("%c%c网站地址%chttps://www.bwmelon.com", "line-height:28px;", "line-height:28px;padding:4px;background:#222;color:#fff;font-size:16px;margin-right:15px", "color:#ff9900;line-height:28px;font-size:16px;");
console.log("%c%cBUG反馈群：%c789371353(遇到问题尽量自己解决，因为我也不一定会*(￣▽￣)~*)", "line-height:28px;", "line-height:28px;padding:4px;background:#222;color:#fff;font-size:16px;margin-right:15px", "color:#008000;line-height:28px;font-size:16px;");



$(function () {

	// 滚动样式
	var swiper = new Swiper('.swiper-container', {
		initialSlide: 0,
		effect: 'coverflow',
		grabCursor: true,
		centeredSlides: true,
		slidesPerView: 'auto',
		loop: true,
		coverflowEffect: {
			rotate: 50,
			stretch: 0,
			depth: 100,
			modifier: 1,
			slideShadows: true,
		},
		pagination: {
			el: '.swiper-pagination',
		},
	});

	autoBottom();




	layui.use(['layer', 'colorpicker'], function () {
		var isrepeated = false;
		var layer = layui.layer;
		var colorpicker = layui.colorpicker;

		// 弹窗广告,不需要则删除该段代码
		// layer.open({
		// 	type: 1,
		// 	area: ['310px', '450px'], //宽高
		// 	content: '<div style="text-align: center;"><br><img src="https://imgs.bwmelon.com/20190516143115.png" style="width:80%;margin-bottom:15px;"><br>"扫码二维码查看支付效果或者打赏"<br>"本站生成的收款码无红包广告"<br>"又拍云CDN加速，收款更快捷"</div>',
		// 	title: '支付宝扫码领红包',
		// 	btn: ['关闭'],
		// 	btnAlign: 'c',
		// 	shade: 0,
		// 	btn1: function () {
		// 		layer.closeAll();
		// 	}
		// });

		// 调用颜色选择器
		function colorpicker() {
			var topColor, bottomColor, recTextColor, bottomTextColor;
			// 主体颜色
			colorpicker.render({
				elem: '#topColorBtn',
				color: '#5a91eb',
				predefine: true,
				colors: ['#5a91eb', '#F00', '#0F0', '#00F', 'rgb(255, 69, 0)'],
				size: 'lg',
				change: function (color) {
					topColor = color;
					makeBg(topColor, bottomColor, recTextColor, bottomTextColor);
				}
			});
			// 底部颜色
			colorpicker.render({
				elem: '#bottomColorBtn',
				color: '#ffffff',
				predefine: true,
				colors: ['#ffffff', '#F00', '#0F0', '#00F', 'rgb(255, 69, 0)'],
				size: 'lg',
				change: function (color) {
					bottomColor = color;
					makeBg(topColor, bottomColor, recTextColor, bottomTextColor);
				}
			});
			// 收款人文字颜色
			colorpicker.render({
				elem: '#recTextColorBtn',
				color: '#ffffff',
				predefine: true,
				colors: ['#ffffff', '#F00', '#0F0', '#00F', 'rgb(255, 69, 0)'],
				size: 'lg',
				change: function (color) {
					recTextColor = color;
					makeBg(topColor, bottomColor, recTextColor, bottomTextColor);
				}
			});
			// 底部文字颜色
			colorpicker.render({
				elem: '#bottomTextColorBtn',
				color: '#5a91eb',
				predefine: true,
				colors: ['#5a91eb', '#F00', '#0F0', '#00F', 'rgb(255, 69, 0)'],
				size: 'lg',
				change: function (color) {
					bottomTextColor = color;
					makeBg(topColor, bottomColor, recTextColor, bottomTextColor);
				}
			});
		}

		//获取qq收款码链接
		function getUrl_qq(e, param) {
			analyticCode.getUrl(
				param, e,
				function (url) {
					if (url == 'error decoding QR Code') {
						layer.msg('二维码解析失败，请重新上传', {
							time: 3000,
							icon: 5
						});
					} else if (url.indexOf('qianbao') == '-1') {
						layer.msg('该收款码不是QQ收款码，请上传QQ收款码', {
							time: 3000,
							icon: 5
						});
					} else {
						layer.msg('上传成功', {
							time: 3000,
							icon: 6
						});
						document.getElementById('qq').value = url;
					}
				}
			)
		}

		//获取微信收款码链接
		function getUrl_wechat(e, param) {
			analyticCode.getUrl(
				param, e,
				function (url) {
					if (url == 'error decoding QR Code') {
						layer.msg('二维码解析失败，请重新上传', {
							time: 3000,
							icon: 5
						});
					} else if (url.indexOf('wxp') == '-1') {
						layer.msg('该收款码不是微信收款码，请上传微信收款码', {
							time: 3000,
							icon: 5
						});
					} else {
						layer.msg('上传成功', {
							time: 3000,
							icon: 6
						});
						document.getElementById('wechat').value = url;
					}
				}
			)
		}

		//获取支付宝收款码链接
		function getUrl_ali(e, param) {
			analyticCode.getUrl(
				param, e,
				function (url) {
					if (url == 'error decoding QR Code') {
						layer.msg('二维码解析失败，请重新上传', {
							time: 3000,
							icon: 5
						});
					} else if (url.indexOf('ALIPAY') == '-1' && url.indexOf('alipay') == '-1') {
						layer.msg('该收款码不是支付宝收款码，请上传支付宝收款码', {
							time: 3000,
							icon: 5
						});
					} else {
						layer.msg('上传成功', {
							time: 3000,
							icon: 6
						});
						document.getElementById('ali').value = url;
					}


				}
			)
		}

		// url编码
		function urlEncode(String) {
			return encodeURIComponent(String).replace(/'/g, "%27").replace(/"/g, "%22");
		}

		// 上传二维码并解析
		$("#qqBtn").on('change', function () {
			getUrl_qq(this, 'file-url');
		})
		$("#wechatBtn").on('change', function () {
			getUrl_wechat(this, 'file-url');
		})
		$("#aliBtn").on('change', function () {
			getUrl_ali(this, 'file-url');
		})

		// 生成收款码（经典样式 可自定义颜色）(当前版本暂时弃用)
		function makeBg(topColor = "#5a91eb", bottomColor = "#ffffff", recTextColor = "#ffffff", bottomTextColor = "#5a91eb", recName, url) {
			// 设置默认属性
			recName = recName || document.getElementById("recName").value;
			//jQuery生成二维码         
			$('#code').qrcode({
				render: "canvas",
				width: 550,
				height: 550,
				text: url,
				foreground: "black",
				background: "white"
			});
			// 开始绘制展示页面
			var canvas = document.getElementById("canvas");
			var ctx = canvas.getContext('2d');
			// 上矩形
			ctx.fillStyle = topColor;
			ctx.fillRect(0, 0, 900, 1090);
			// 下矩形
			ctx.fillStyle = bottomColor;
			ctx.fillRect(0, 1090, 900, 130);
			// 二维码矩形
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(140, 200, 600, 600);
			// 微信
			ctx.textAlign = "center";
			ctx.font = "40px '黑体'";
			ctx.fillStyle = "#ffffff";
			ctx.fillText("微信", 226, 1052);
			// 支付宝
			ctx.font = "40px '黑体'";
			ctx.fillStyle = "#ffffff";
			ctx.fillText("支付宝", 450, 1052);
			// QQ钱包
			ctx.font = "40px '黑体'";
			ctx.fillStyle = "#ffffff";
			ctx.fillText("QQ钱包", 672, 1052);
			// 收款名
			ctx.font = "70px '黑体'";
			ctx.fillStyle = recTextColor;
			ctx.fillText("扫码向“" + recName + "”付款", 450, 120);
			// 下文本
			ctx.font = "80px '华文新魏'";
			ctx.fillStyle = bottomTextColor;
			ctx.fillText("万能收款码", 450, 1183);

			var canvas = document.getElementById("canvas");
			var ctx = canvas.getContext('2d');
			var canvasOld = document.getElementsByTagName('canvas')[0];
			ctx.drawImage(canvasOld, 166, 224);


			// 生成三个图标
			new Promise((resolve, reject) => {
				$("#endImg").show();
				var imgWechat = new Image();
				imgWechat.src = "imgs/icons/wechat.png";
				imgWechat.onload = function () {
					ctx.drawImage(imgWechat, 170, 872, 123, 123);
					resolve();

				}
			}).then(() => {
				return new Promise((resolve, reject) => {
					var imgAlipay = new Image();
					imgAlipay.src = "imgs/icons/alipay.png";
					imgAlipay.onload = function () {
						ctx.drawImage(imgAlipay, 390, 872, 123, 123);
						resolve();
					}
				})
			}).then(() => {
				return new Promise((resolve, reject) => {
					var imgQQ = new Image();
					imgQQ.src = "imgs/icons/QQ.png";
					imgQQ.onload = function () {
						ctx.drawImage(imgQQ, 611, 872, 123, 123);
						//canvas转成图片，以便移动端长按保存
						var image = new Image();
						image.src = canvas.toDataURL("image/png");
						$(".form-horizontal img").attr("src", image.src);
						$("canvas").hide();
						$("#endImg").show();
						// 显示下载按钮
						$("#downImg").show();
						// 显示颜色修改区域
						$("#adjustColor").show();
						resolve();
					}
				})
			}).then(() => {
				// 判断是否重复生成
				autoBottom();
			})


		}

		// 生成收款码（其他样式 背景图已指定）
		function makeDiyBg(element, qrWidth, qrHeight, url, foreground, background, imgUrl, imgWidth, imgHeight, font, fontColor, recName, recNameLeft = imgWidth / 2, recNameTop, qrLeft, qrTop) {
			$(element).qrcode({
				render: "canvas",
				width: qrWidth,
				height: qrHeight,
				text: url,
				foreground: foreground,
				background: background
			});
			var canvas = document.getElementById('canvas');
			canvas.width = imgWidth;
			canvas.height = imgHeight;
			var ctx = canvas.getContext("2d");
			var img = new Image();
			img.src = imgUrl;
			img.onload = function () {
				// 生成背景图
				var bg = ctx.createPattern(img, "no-repeat");
				ctx.fillStyle = bg;
				ctx.fillRect(0, 0, imgWidth, imgHeight);
				// 生成收款名
				ctx.textAlign = "center";
				ctx.font = font;
				ctx.fillStyle = fontColor;
				if (recName) {
					ctx.fillText("扫码向“" + recName + "”付款", 450, 178);
				}
				// 在canvas上生成二维码
				var canvasOld = document.getElementsByTagName('canvas')[0];
				ctx.drawImage(canvasOld, qrLeft, qrTop);

				var image = new Image();
				image.src = canvas.toDataURL("image/png");
				$(".form-horizontal img").attr("src", image.src);
				// $("canvas").hide();
				// $("#endImg").show();
				// 显示下载按钮
				// $("#downImg").show();
			}
		}

		$("#make").click(function () {

			// 重置canvas里面的二维码
			$("#code").empty();

			// 原未缩短长链接
			var longUrl = document.location.protocol + "//" + window.location.host + window.location.pathname + "allqr.html?qqUrl=" + urlEncode($("#qq").val()) + "&wechatUrl=" + urlEncode($("#wechat").val()) + "&aliUrl=" + urlEncode($("#ali").val());

			// 开始生成弹出层
			layer.msg('生成中', {
				icon: 16,
				shade: 0.01,
				time: 10 * 1000
			});

			//由于原来生成的链接太长，生成的二维码太密集，所以通过新浪短网址(https://open.weibo.com/wiki/%E5%BE%AE%E5%8D%9AAPI#.E7.9F.AD.E9.93.BE)生成短网址
			$.ajax({
				type: 'get',
				url: '//api.weibo.com/2/short_url/shorten.json?source=2849184197&url_long=' + urlEncode(longUrl),
				dataType: "JSONP",
				success: function (res) {
					// 生成缩网址二维码
					// console.log('//api.weibo.com/2/short_url/shorten.json?source=2849184197&url_long=1' + urlEncode(longUrl));
					// console.log("短网址:"+ res.data.urls[0].url_short);

					// makeBg(undefined, undefined, undefined, undefined, undefined, res.data.urls[0].url_short);
					layer.closeAll();
					// 获取当前被选中样式图片地址
					var nowUrl = document.querySelector(".swiper-slide-active").style.backgroundImage.replace('url(', '').replace(')', '').replace('"', '').replace('"', '');

					// 获取当前被选中样式图片名称 获取到的名称用来在配置文件中查找
					var nowName = nowUrl.substring(12, nowUrl.indexOf(".png"));

					// 从config.json文件中读取样式配置
					var getJson = $.ajax({
						type: 'get',
						url: "config.json",
						async: true,
						success: function () {
							var styleName = nowName;
							var config = JSON.parse(getJson.responseText);
							var qrWidth = config[styleName].qrWidth;
							var qrHeight = config[styleName].qrHeight;
							var foreground = config[styleName].foreground;
							var background = config[styleName].background;
							var imgWidth = config[styleName].imgWidth;
							var imgHeight = config[styleName].imgHeight;
							var font = config[styleName].font;
							var fontColor = config[styleName].fontColor;
							var recNameLeft = config[styleName].recNameLeft;
							var recNameTop = config[styleName].recNameTop;
							var qrLeft = config[styleName].qrLeft;
							var qrTop = config[styleName].qrTop;
							makeDiyBg("#code", qrWidth, qrHeight, res.data.urls[0].url_short, foreground, background, nowUrl, imgWidth, imgHeight, font, fontColor, document.getElementById("recName").value, recNameLeft, recNameTop, qrLeft, qrTop);
							autoBottom();
							//页面层-收款码
							setTimeout(() => {
								layer.open({
									type: 1,
									title: false,
									closeBtn: 2,
									anim: 0,
									zIndex: 5,
									area: 'auto',
									shadeClose: true,
									content: $('#endImg'),
									btn: ['长按图片或点我保存'],
									btnAlign: 'c',
									yes: function () {
										var img = document.getElementById('endImg');
										var url = img.src;
										var a = document.createElement('a');
										var event = new MouseEvent('click');
										a.download = '万能收款码-' + document.getElementById("recName").value;
										a.href = url;
										a.dispatchEvent(event);
									}
								});
							}, 100);
						}
					})

					layer.msg('收款码生成成功，请长按或右击保存', {
						time: 2000,
						icon: 6
					});
				},
				error: function (jqXHR, textStatus, errorThrown) {
					if (jqXHR.statusText == "error") {
						layer.closeAll();    
						// 获取当前被选中样式图片地址
						var nowUrl = document.querySelector(".swiper-slide-active").style.backgroundImage.replace('url(', '').replace(')', '').replace('"', '').replace('"', '');

						// 获取当前被选中样式图片名称 获取到的名称用来在配置文件中查找
						var nowName = nowUrl.substring(12, nowUrl.indexOf(".png"));

						// 从config.json文件中读取样式配置
						var getJson = $.ajax({
							type: 'get',
							url: "config.json",
							async: true,
							success: function () {
								var styleName = nowName;
								var config = JSON.parse(getJson.responseText);
								var qrWidth = config[styleName].qrWidth;
								var qrHeight = config[styleName].qrHeight;
								var foreground = config[styleName].foreground;
								var background = config[styleName].background;
								var imgWidth = config[styleName].imgWidth;
								var imgHeight = config[styleName].imgHeight;
								var font = config[styleName].font;
								var fontColor = config[styleName].fontColor;
								var recNameLeft = config[styleName].recNameLeft;
								var recNameTop = config[styleName].recNameTop;
								var qrLeft = config[styleName].qrLeft;
								var qrTop = config[styleName].qrTop;
								makeDiyBg("#code", qrWidth, qrHeight, longUrl, foreground, background, nowUrl, imgWidth, imgHeight, font, fontColor, document.getElementById("recName").value, recNameLeft, recNameTop, qrLeft, qrTop);
								autoBottom();
								//页面层-收款码
								setTimeout(() => {
									layer.open({
										type: 1,
										title: false,
										closeBtn: 2,
										anim: 0,
										zIndex: 5,
										area: 'auto',
										shadeClose: true,
										content: $('#endImg'),
										btn: ['长按图片或点我保存'],
										btnAlign: 'c',
										yes: function () {
											var img = document.getElementById('endImg');
											var url = img.src;
											var a = document.createElement('a');
											var event = new MouseEvent('click');
											a.download = '万能收款码-' + document.getElementById("recName").value;
											a.href = url;
											a.dispatchEvent(event);
										}
									});
								}, 100);
							}
						})
						layer.msg('收款码生成成功，但是二维码简化失败，请长按或右击保存', {
							time: 3000,
							icon: 5
						});
					}
				}
			})
		})

		//点击按钮保存图片
		$("#downImg").click(function () {
			var img = document.getElementById('endImg');
			var url = img.src;
			var a = document.createElement('a');
			var event = new MouseEvent('click');
			a.download = '万能收款码-' + document.getElementById("recName").value;
			a.href = url;
			a.dispatchEvent(event);
		})



	})
	// 底部导航条自适应
	function autoBottom() {
		if ($(document.body).height() > $(window).height()) {
			// 取消底部导航栏固定
			$("footer").removeClass(" navbar-fixed-bottom");
			// 修改底部导航栏样式
			$("footer").addClass("afterMakeNav");
		}
	}

});