console.log("%c", "padding:50px 300px;line-height:120px;background:url('http://5b0988e595225.cdn.sohucs.com/images/20181014/000c8b57362f4391af0d5f48a18ad638.gif') repeat;");
console.log("%c%c博客名称%c大西瓜博客", "line-height:28px;", "line-height:28px;padding:4px;background:#222;color:#fff;font-size:16px;margin-right:15px", "color:#3fa9f5;line-height:28px;font-size:16px;");
console.log("%c%c网站地址%chttps://www.bwmelon.com", "line-height:28px;", "line-height:28px;padding:4px;background:#222;color:#fff;font-size:16px;margin-right:15px", "color:#ff9900;line-height:28px;font-size:16px;");
console.log("%c%cBUG反馈群：%c789371353(遇到问题尽量自己解决，因为我也不一定会*(￣▽￣)~*)", "line-height:28px;", "line-height:28px;padding:4px;background:#222;color:#fff;font-size:16px;margin-right:15px", "color:#008000;line-height:28px;font-size:16px;");



$(function () {
	layui.use(['layer'], function () {

		var layer = layui.layer;
		autoBottom();
		// 模板滚动样式
		new Swiper('.swiper-container', {
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

		/**
		 * url编码
		 * @param {String} String 
		 */
		function urlEncode(String) {
			return encodeURIComponent(String).replace(/'/g, "%27").replace(/"/g, "%22");
		}

		// 上传QQ二维码并解析(主用解析库)
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
					getUrl_qq(this, 'file-url');
				}
			}, 200);

		});

		//获取qq收款码链接(备用解析库)
		function getUrl_qq(e, param) {
			analyticCode.getUrl(
				param, e,
				function (url) {
					if (url == 'error decoding QR Code') {
						layer.confirm('该收款码解码失败，是否前往第三方网站获取收款码链接？', {
							btn: ['立刻前往', '朕不想去']
						}, function () {
							window.open('https://jiema.wwei.cn/', '_blank').location;
							layer.closeAll();
						}, function () {});
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

		// 上传微信二维码并解析(主用解析库)
		$("#wechatBtn").on('change', function (e) {
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
					if (result.data.indexOf('wxp') == '-1') {
						layer.msg('该收款码不是微信收款码，请上传微信收款码', {
							time: 3000,
							icon: 5
						});
					} else {
						layer.msg('上传成功', {
							time: 3000,
							icon: 6
						});
						document.getElementById('wechat').value = result.data;
					}
				} else {
					getUrl_wechat(this, 'file-url');
				}
			}, 200);

		});
		//获取微信收款码链接(备用解析库)
		function getUrl_wechat(e, param) {
			analyticCode.getUrl(
				param, e,
				function (url) {
					if (url == 'error decoding QR Code') {
						layer.confirm('该收款码解码失败，是否前往第三方网站获取收款码链接？', {
							btn: ['立刻前往', '朕不想去']
						}, function () {
							window.open('https://jiema.wwei.cn/', '_blank').location;
							layer.closeAll();
						}, function () {});
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

		// 上传支付宝二维码并解析(主用解析库)
		$("#aliBtn").on('change', function (e) {
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
					if (result.data.indexOf('ALIPAY') == '-1' && result.data.indexOf('alipay') == '-1') {
						layer.msg('该收款码不是支付宝收款码，请上传支付宝收款码', {
							time: 3000,
							icon: 5
						});
					} else {
						layer.msg('上传成功', {
							time: 3000,
							icon: 6
						});
						document.getElementById('ali').value = result.data;
					}
				} else {
					getUrl_ali(this, 'file-url');
				}
			}, 200);

		});
		//获取支付宝收款码链接(备用解析库)
		function getUrl_ali(e, param) {
			analyticCode.getUrl(
				param, e,
				function (url) {
					if (url == 'error decoding QR Code') {
						layer.confirm('该收款码解码失败，是否前往第三方网站获取收款码链接？', {
							btn: ['立刻前往', '朕不想去']
						}, function () {
							window.open('https://jiema.wwei.cn/', '_blank').location;
							layer.closeAll();
						}, function () {});
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


		/**
		 * 生成普通样式二维码
		 * @param {HTMLElement} element 
		 * @param {Number} qrWidth 二维码宽度
		 * @param {Number} qrHeight 二维码高度
		 * @param {String} tinyurl 二维码地址、内容
		 * @param {String} foreground 前景色
		 * @param {String} background 背景色
		 * @param {String} imgUrl 背景地址
		 * @param {Number} imgWidth 图片宽度
		 * @param {Number} imgHeight 图片高度
		 * @param {String} font 字体
		 * @param {String} fontColor 颜色 
		 * @param {String} recName 收款名
		 * @param {Number} recNameLeft 收款名左侧距离
		 * @param {Number} recNameTop 收款名顶部距离
		 * @param {Number} qrLeft 二维码左侧距离
		 * @param {Number} qrTop 二维码顶部距离
		 */
		function makeDiyBg(element, qrWidth, qrHeight, tinyurl, foreground, background, imgUrl, imgWidth, imgHeight, font, fontColor, recName, recNameLeft, recNameTop, qrLeft, qrTop) {
			$(element).qrcode({
				render: "canvas",
				width: qrWidth,
				height: qrHeight,
				text: tinyurl,
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

			//由于原来生成的链接太长，生成的二维码太密集，所以通过腾讯/新浪生成短网址
			$.ajax({
				type: 'get',
				url: 'long2tiny.php?&url_long=' + urlEncode(urlEncode(longUrl)),
				success: function (tinyurl) {
					// 生成缩网址二维码
					layer.closeAll();
					// 获取当前被选中样式图片地址
					var nowUrl = document.querySelector(".swiper-slide-active").style.backgroundImage.replace('url(', '').replace(')', '').replace('"', '').replace('"', '');

					// 判断index.html引用图片的方式
					var nowName = $(".swiper-slide-active").attr("mould-name") ? $(".swiper-slide-active").attr("mould-name") : nowUrl.split("/").pop().replace(".png", "");

					// 判断是否为艺术码
					var dataArt = document.querySelector(".swiper-slide-active").dataset.art;

					if (dataArt) {
						makeArtQrcode(dataArt, tinyurl);
					} else {
						makeCommonQrcode(nowUrl, nowName, tinyurl);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					if (textStatus == "error") {
						layer.msg('收款码生成失败，请联系网站管理员', {
							time: 3000,
							icon: 5
						});
					}
				}
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

		/**
		 * 生成普通二维码，从config.json文件中读取样式配置
		 */
		function makeCommonQrcode(nowUrl, nowName, tinyurl) {
			getCommonQrcodeCfg().then(res => {
				var styleName = nowName;
				var config = res;
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
				makeDiyBg("#code", qrWidth, qrHeight, tinyurl, foreground, background, nowUrl, imgWidth, imgHeight, font, fontColor, document.getElementById("recName").value, recNameLeft, recNameTop, qrLeft, qrTop);
				autoBottom();
				setTimeout(function () {
					alertQrcode("#endImg");
					alertInfo();
				}, 100);

			})
		}

		/**
		 * 获取普通码信息，从art-config.json文件中读取样式配置
		 */
		async function getCommonQrcodeCfg() {
			return await fetch("config.json")
				.then(res => {
					return res.json();
				});
		}

		/**
		 * 获取艺术码信息
		 */
		async function getArtQrcodeCfg() {
			return await fetch("art-config.json")
				.then(res => {
					return res.json();
				});
		}

		// 生成艺术二维码
		function makeArtQrcode(mouldName, tinyurl) {
			$("#qrcode").empty();
			getArtQrcodeCfg().then(res => {
				res[mouldName].materials.border = "./imgs/bgimgs/" + mouldName + ".png";
				var options = {
					text: tinyurl,
					width: res[mouldName].imgWidth,
					height: res[mouldName].imgHeight,
					codeWidth: res[mouldName].qrWidth,
					codeHeight: res[mouldName].qrHeight,
					top: res[mouldName].qrTop,
					left: res[mouldName].qrLeft,
					materials: res[mouldName].materials
				}
				new QRCodeA(document.getElementById("qrcode"), options, callBack);
				$("#qrcode").show();
			})
		}

		/**
		 * 弹出生成的收款码
		 * @param {String} element 需要弹出的元素 
		 */
		function alertQrcode(element) {
			layer.open({
				type: 1,
				title: false,
				closeBtn: 2,
				anim: 0,
				zIndex: 5,
				area: 'auto',
				shadeClose: true,
				content: $(element),
				btn: ['长按图片或点我保存'],
				btnAlign: 'c',
				yes: function () {
					var img = document.querySelector(element);
					var url = img.src;
					var a = document.createElement('a');
					var event = new MouseEvent('click');
					a.download = '万能收款码-' + document.getElementById("recName").value;
					a.href = url;
					a.dispatchEvent(event);
				}
			});
		}

		/**
		 * 生成成功后弹出提示信息
		 */
		function alertInfo() {
			layer.msg('收款码生成成功，请长按或右击保存', {
				time: 2000,
				icon: 6
			});
		}

		/**
		 * 艺术二维码回调函数
		 * @param {String} status [loaded|success]
		 */
		function callBack(status) {
			if (status == "success") {
				setTimeout(() => {
					layer.closeAll();
					alertInfo();
					alertQrcode("#art-qrcode");
				}, 10);
			}
		}
	})


});