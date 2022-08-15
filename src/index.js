var path = require("path");
var fs = require("fs");
const wsourcePrefix = '<?xml version="1.0" encoding="UTF-8">\n'
+ '<ExternalSourceList SchemaVersion="1" Root="ExternalSource">\n'
const wsourceSuffix = '</ExternalSourcesList>\n'
let wsource = wsourcePrefix; 
let wsourceJson = {};
// 函数实现，参数单位 毫秒 ；
function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
};


async function jsonToWsource(wsourceJson){
	for (let i = 0;i < wsourceJson.length;i++){
		wsource = `${wsource}<Source path="${wsourceJson[i].TechnicalName}" Conversion="${wsourceJson[i].TechnicalName}"/>\n`;
	}
	//wsource = wsource + wsourceSuffix;
}
async function outPutWsource(wsource){
	fs.writeFile('C:/Users/mengqingjie1/Desktop/test.wsource', wsource, err => {
		if (err) {
		  console.error(err)
		  return
		}
	})
}

document.addEventListener('drop', async (event) => {
	event.preventDefault();
	event.stopPropagation();

	for (const f of event.dataTransfer.files) {
		// Using the path attribute to get absolute file path
		console.log('File Path of dragged files: ', f.path)

		fs.readFile(f.path, 'utf8' , (err, data) => {
			if (err) {
			  console.error(err)
			  return
			}
			//wsourceJson = JSON.stringify(data);
			wsourceJson = JSON.parse(data);
			// for (const i of data){
			// 	console.log(i);
			// }
			console.log(wsourceJson)
			jsonToWsource(wsourceJson);
		  })
		  outPutWsource(wsource);
		
	}
		
	
});
document.addEventListener('dragover', (e) => {
	e.preventDefault();
	e.stopPropagation();
});

document.addEventListener('dragenter', (event) => {
	console.log('File is in the Drop Space');
});

document.addEventListener('dragleave', (event) => {
	console.log('File has left the Drop Space');
});