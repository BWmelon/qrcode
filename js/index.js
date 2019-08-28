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
		mousewheel: true,
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
		layer.open({
			type: 1,
			area: ['310px', '450px'], //宽高
			content: '<div style="text-align: center;"><br><img src="https://imgs.bwmelon.com/20190722123548.png" style="width:80%;margin-bottom:15px;"><br>"扫码二维码查看支付效果或者打赏"<br>"本站生成的收款码无红包广告"<br>"又拍云CDN加速，收款更快捷"</div>',
			title: '支付宝扫码领红包',
			btn: ['关闭'],
			btnAlign: 'c',
			shade: 0,
			btn1: function () {
				layer.closeAll();
			}
		});


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
		$("#qqBtn").on('change', function (e) {
			hasImage = false;
			var imageData = null;
			var file = e.target.files[0];
			var canvas = $("#canvas")[0];
			var context = canvas.getContext('2d');
			if (file) {
				hasImage = false;
				imageData = null;
				var reader = new FileReader();
				reader.onload = function (e) {
					var img = new Image();
					img.crossOrigin = 'anonymous';
					img.onload = function () {
						var width = img.width;
						var height = img.height;
						var actualWidth = Math.min(960, width);
						var actualHeight = height * (actualWidth / width);

						hasImage = true;
						canvas.width = actualWidth;
						canvas.height = actualHeight;

						context.drawImage(img, 0, 0, width, height, 0, 0, actualWidth, actualHeight);

						imageData = context.getImageData(0, 0, actualWidth, actualHeight);

					};
					img.src = e.target.result;
				};
			}
			reader.readAsDataURL(file);

			setTimeout(() => {
				var result = new QRCode.Decoder().decode(imageData.data, imageData.width, imageData.height);
				if (result) {
					if (result.data.indexOf('qianbao') == '-1') {
						layer.msg('该收款码不是QQ收款码，请上传QQ收款码', {
							time: 3000,
							icon: 5
						});
					} else {
						layer.msg('上传成功', {
							time: 3000,
							icon: 6
						});
						document.getElementById('qq').value = result.data;
					}
				} else {
					layer.msg('二维码解析失败，请重新上传', {
						time: 3000,
						icon: 5
					});
				}
			}, 200);

		});
		$("#wechatBtn").on('change', function () {
			getUrl_wechat(this, 'file-url');
		})
		$("#aliBtn").on('change', function () {
			getUrl_ali(this, 'file-url');
		})

		// 生成收款码（其他样式 背景图已指定）
		function makeDiyBg(element, qrWidth, qrHeight, url, foreground, background, imgUrl, imgWidth, imgHeight, font, fontColor, recName, recNameLeft, recNameTop, qrLeft, qrTop) {
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
			img.crossOrigin = "Anonymous"
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
					if (!recNameLeft) {
						recNameLeft = imgWidth / 2;
					}
					ctx.fillText("扫码向“" + recName + "”付款", recNameLeft, recNameTop);
				}
				// 在canvas上生成二维码
				var canvasOld = document.getElementsByTagName('canvas')[0];
				ctx.drawImage(canvasOld, qrLeft, qrTop);


				var image = new Image();
				image.crossOrigin = "Anonymous"
				image.src = canvas.toDataURL("image/png");
				$(".form-horizontal img").attr("src", image.src);
			}
		}

		$("#make").click(function () {

			// 重置canvas里面的二维码
			$("#code").empty();

			// 原未缩短长链接
			var longUrl = document.location.protocol + "//" + window.location.host + window.location.pathname + "allqr.html?qqUrl=" + urlEncode($("#qq").val()) + "&wechatUrl=" + urlEncode($("#wechat").val()) + "&aliUrl=" + urlEncode($("#ali").val()) + "&qq=" + urlEncode($("#qqlogo").val()) + "&recname=" + encodeURI(encodeURI($("#recName").val()));

			// 开始生成弹出层
			layer.msg('生成中', {
				icon: 16,
				shade: 0.01,
				time: 10 * 1000
			});

			//由于原来生成的链接太长，生成的二维码太密集，所以通过新浪短网址(https://open.weibo.com/wiki/%E5%BE%AE%E5%8D%9AAPI#.E7.9F.AD.E9.93.BE)生成短网址
			$.ajax({
				type: 'get',
				url: 'long2tiny.php?&url_long=' + urlEncode(urlEncode(longUrl)),
				success: function (res) {				
					// 生成缩网址二维码
					layer.closeAll();
					// 获取当前被选中样式图片地址
					var nowUrl = document.querySelector(".swiper-slide-active").style.backgroundImage.replace('url(', '').replace(')', '').replace('"', '').replace('"', '');
					
					// 判断index.html引用图片的方式
					var nowName = $(".swiper-slide-active").attr("mould-name") ? $(".swiper-slide-active").attr("mould-name") : nowUrl.split("/").pop().replace(".png", "");
					
					// 从config.json文件中读取样式配置
					var getJson = $.ajax({
						type: 'get',
						url: "config.json",
						dataType: "JSON",
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
							makeDiyBg("#code", qrWidth, qrHeight, res, foreground, background, nowUrl, imgWidth, imgHeight, font, fontColor, document.getElementById("recName").value, recNameLeft, recNameTop, qrLeft, qrTop);
							autoBottom();
							//页面层-收款码
							setTimeout(function () {
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
						// 生成原链接二维码
						layer.closeAll();
						// 获取当前被选中样式图片地址
						var nowUrl = document.querySelector(".swiper-slide-active").style.backgroundImage.replace('url(', '').replace(')', '').replace('"', '').replace('"', '');

						// 获取当前被选中样式图片名称 获取到的名称用来在配置文件中查找
						var nowName = nowUrl.split("/").pop().replace(".png", "");

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
								setTimeout(function () {
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