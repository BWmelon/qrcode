!function(){
	"use strict";
	
	//获取预览图片路径
	let getObjectURL = function(file){
	    let url = null ; 
	    if (window.createObjectURL!=undefined) { // basic
	        url = window.createObjectURL(file) ;
	    } else if (window.URL!=undefined) { // mozilla(firefox)
	        url = window.URL.createObjectURL(file) ;
	    } else if (window.webkitURL!=undefined) { // webkit or chrome
	        url = window.webkitURL.createObjectURL(file) ;
	    }
	    return url ;
	}
	
	
	window.analyticCode = {
		getUrl : function(type,elem,fn){
			let url = null,src = null;
			
			if(type === 'img-url'){
				url = elem.src;
			}else if(type === 'file-url' && elem.files.length > 0){
				url = getObjectURL(elem.files[0]);
			}
			qrcode.decode(url);
			qrcode.callback = function(imgMsg){
				fn(imgMsg,url);
			}
		}
	}
}()
