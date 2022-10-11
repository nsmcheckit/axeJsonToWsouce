var path = require("path");
var fs = require("fs");
//const articyJsonPath = "../../xlsxtojson/json";//build
const articyJsonPath = "../xlsxtojson/json";//npm run start
const externalSourcePath = "../../../Game_WwiseProject/ExternalSources/";
//const externalSourcePath2 = "../../../Game_WwiseProject/ExternalSources/";//build
const externalSourcePath2 = "../../Game_WwiseProject/ExternalSources/";//npm run start
const wsourcePrefix = '<?xml version="1.0" encoding="UTF-8">\n'
+ '<ExternalSourceList SchemaVersion="1" Root="ExternalSource">\n';
const wsourceSuffix = '</ExternalSourcesList>\n';
let wsource = ""; 
let wsourceString = "";
let wsourceJson = {};
let jsonListAll = {};//暂时存储的jsonList;
var path = require("path");
var list = [];
var jsonList = [];//articyJson文件
var watch = require('watch');

initWatchFile();
watchFile();


function jsonMatchWav(){
	var wavList = [];//实际的wav文件数量
	var jsonWavList = [];//json文件中的wav文件数量
	var wavWrongNameList = [];//json文件中错误命名的wav文件数量
	for(let i=0; i<listFile(externalSourcePath2).length; i++){
		if(listFile(externalSourcePath2)[i].split("\\").slice(-1) != "ExternalSources.wsources"){
			wavList.push(listFile(externalSourcePath2)[i].split("\\").slice(-1));
		}
	}
	//console.log(wavList);
	//console.log(wsourceString);
	for (var i in jsonListAll){
		for (let j = 0; j < jsonListAll[i].length; j++){
			if(!jsonWavList.includes(jsonListAll[i][j]["Audio File Name(文件命名)"])){
				jsonWavList.push(jsonListAll[i][j]["Audio File Name(文件命名)"]);
			}
		}
	}
	for (let i = 0; i < jsonWavList.length; i++){
		if(wavList.indexOf(jsonWavList) == -1){
			wavWrongNameList.push(jsonWavList[i]);
		}
	}
	if(wavWrongNameList.length === 0 && jsonWavList.length === wavList.length){
		console.error("所有wav文件与json文件匹配");
	}
	else{
		console.error("wav文件数量：" + wavList.length + "\n" 
		+ "json中wav文件数量：" + jsonWavList.length + "\n\n"
		+ "缺少wav文件名：\n" + wavWrongNameList.join("\n") + "\n");
	}
}

//检测目前文件夹内有什么文件，并初始化wsource文件
function initWatchFile(){
	jsonList = listFile(articyJsonPath);
	console.log("目前json文件夹下有如下文件： ");
	return new Promise((resolve,reject) =>{
		for(let i = 0; i<jsonList.length; i++){
			if(jsonList[i] !== undefined){
				console.log("\t"+jsonList[i].split("\\").slice(-1) + "\n");
				addJsonListAll(jsonList[i].split("\\").slice(-1),articyJsonPath)
			}
		}
		jsonToWsource(jsonListAll,wsource);
	})
};


function watchFile(){
	watch.createMonitor(articyJsonPath,function(monitor){
		monitor.on("created",function(filename,stat){
			console.log("增加了如下文件: "+filename.split("\\").slice(-1) + "\n");
			if (!jsonList.includes(filename)){
				jsonList.push(filename);
			}
			console.log("目前json文件夹下有如下文件");
			for(let i = 0; i<jsonList.length; i++){
				if(jsonList[i] !== undefined){
					console.log("\t"+jsonList[i].split("\\").slice(-1) + "\n");
				}
			}
			addJsonListAll(filename.split("\\").slice(-1),articyJsonPath);
			jsonToWsource(jsonListAll,wsource);
		});
		monitor.on("removed",function(filename,stat) {
			console.log("删除了如下文件: "+filename);
			if (jsonList.includes(filename)){
				delete jsonList[jsonList.indexOf(filename)];
			}
			console.log("目前json文件夹下有如下文件");
			for(let i = 0; i<jsonList.length; i++){
				if(jsonList[i] !== undefined){
					console.log("\t"+jsonList[i].split("\\").slice(-1) + "\n");
				}
			}
			removeJson(filename.split("\\").slice(-1),articyJsonPath);
			jsonToWsource(jsonListAll,wsource);
		});
		monitor.on("changed",function(filename,currentStat,previousStat){
			console.log("changed:"+filename);
			if (!jsonList.includes(filename)){
				jsonList.push(filename);
			}
			console.log("目前json文件夹下有如下文件");
			for(let i = 0; i<jsonList.length; i++){
				if(jsonList[i] !== undefined){
					console.log("\t"+jsonList[i].split("\\").slice(-1) + "\n");
				}
			}
			addJsonListAll(filename.split("\\").slice(-1),articyJsonPath);
			jsonToWsource(jsonListAll,wsource);
	});
	});
}

//遍历整个文件夹下的文件
function listFile(dir){
	list = [];
	var arr = fs.readdirSync(dir);
	arr.forEach(function(item){
		var fullpath = path.join(dir,item);
		var stats = fs.statSync(fullpath);
		if(stats.isDirectory()){
			listFile(fullpath);
		}else{
			list.push(fullpath);
		}
	});
	return list;
}

//创建一个临时存储被修改的json集合
function addJsonListAll(file,path){
	fs.readFile(path+"/"+file,'utf8',(err,data) => {
		if(err){
			console.error(err)
			return
		}
		let dataJson = JSON.parse(data);
			jsonListAll[file] = dataJson;
		
	})
	//console.log(jsonListAll);

}

function removeJson(file, path){
	delete jsonListAll[file];
	//console.log(jsonListAll);
}

function XML2String(xmlobject) {
    // for IE
    if (window.ActiveXObject) {      
      return xmlobject.xml;
    }
    // for other browsers
    else {       
      return (new XMLSerializer()).serializeToString(xmlobject);
    }
  }

function jsonToWsource(jsonListAll,wsource){
	setTimeout(() => {
		//wsource = LoadXMLFile(externalSourcePath+"axe_ExternalSources.wsources");//读wsource
		//wsourceString = XML2String(wsource)
		wsourceString = wsourcePrefix;
		let wsourceStringTemp = []; 
		//wsourceString = wsourceString.split("\n").slice(0,-1).join("\n") + "\n";
		for (var i in jsonListAll){
			for (let j = 0; j < jsonListAll[i].length; j++){
				//遍历整个wsource.xml,对比对应的source path 
				//		一、如果一样，对比conversion，
				//			1、如果一样，不写入wsourceString
				//			2、如果不一样，写入wsourceString，新建一个sourcechange[]，准备之后在wsource中删除这些（这时还没有wsourceString = XML2String(wsource)）
				//		二、如果不一样，写入wsourceString
				//这时wsourceString有： 新增的、修改的
				if(!wsourceStringTemp.includes(`\t<Source Path="${jsonListAll[i][j]["Audio File Name(文件命名)"]}" Conversion="${jsonListAll[i][j].Conversion}"/>\n`)){
					wsourceString += `\t<Source Path="${jsonListAll[i][j]["Audio File Name(文件命名)"]}" Conversion="${jsonListAll[i][j].Conversion}"/>\n`;
					wsourceStringTemp.push(`\t<Source Path="${jsonListAll[i][j]["Audio File Name(文件命名)"]}" Conversion="${jsonListAll[i][j].Conversion}"/>\n`);
				}
			}
			// var newNode=document.createElement("Source");//创建元素节点
			// newNode.setAttribute("Path",wsourceJson[i].TechnicalName);
			// newNode.setAttribute("Conversion",wsourceJson[i].TechnicalName);
			// var nodeBook =wsource.getElementsByTagName('Source')[0].parentNode;//找到节点parent
			// nodeBook.appendChild(newNode);//把newNode作为子节点追加到父节点book的子节点后面。也就是说，要追加节点，必须先找到父节点。
		}
		wsourceString += wsourceSuffix;
		fs.writeFile(externalSourcePath2+"ExternalSources.wsources", wsourceString, err => {
			if (err) {
				console.error(err)
				return
				}})
		console.log("wsource读写成功");
		jsonMatchWav();
	}, 500);
	
 }

function LoadXMLFile(xmlFile) {  
		var xmlDom = null;  
		if (window.ActiveXObject) {  
			xmlDom = new ActiveXObject("Microsoft.XMLDOM");  
			//xmlDom.loadXML(xmlFile);//如果用的是XML字符串  
			xmlDom.load(xmlFile); //如果用的是xml文件。  
		} else if (document.implementation && document.implementation.createDocument) {  
			var xmlhttp = new window.XMLHttpRequest();  
			xmlhttp.open("GET", xmlFile, false);  
			xmlhttp.send(null);  
			xmlDom = xmlhttp.responseXML.documentElement;//一定要有根节点(否则google浏览器读取不了)  
		} else {  
			xmlDom = null;  
		}  
		return xmlDom;  
} 


